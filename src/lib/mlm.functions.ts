import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

// Helper: server-side anon/publishable Supabase client for public-facing RPCs
// (registration, password reset). It uses only the public URL + key so the app
// can be deployed on Netlify/Hostinger without a service-role key.
async function getAnonSupabase() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) {
    throw new Error("Supabase environment variables are missing");
  }
  const { createClient } = await import("@supabase/supabase-js");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        // The new-format sb_ publishable keys are not JWTs; sending them as a
        // Bearer token makes PostgREST fail. Drop the auto-added Authorization
        // header and send the key as apikey instead.
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// Mobile number is the login credential. It is mapped to a synthetic auth email
// (<mobile>@rs.local) so one real Gmail can be reused across many member accounts.
export const registerMember = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({
      fullName: z.string().trim().min(2).max(100),
      mobile: z.string().regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit mobile number"),
      realEmail: z.string().trim().email().max(255),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth"),
      password: z.string().min(6).max(72),
      sponsorCode: z.string().trim().max(20).default(""),
      position: z.enum(["left", "right"]),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const supabase = await getAnonSupabase();
    const { data: result, error } = await supabase.rpc("register_member", {
      _full_name: data.fullName,
      _mobile: data.mobile,
      _real_email: data.realEmail,
      _dob: data.dob,
      _password: data.password,
      _sponsor_code: data.sponsorCode || "",
      _position: data.position,
      _activate: false,
    });
    if (error) throw new Error(error.message);
    const typed = result as unknown as { ok: boolean; memberCode: string; referralCode: string };
    if (!typed?.ok) throw new Error("Registration failed");
    return typed;
  });

export const adminAddMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      fullName: z.string().trim().min(2).max(100),
      mobile: z.string().regex(/^[6-9][0-9]{9}$/),
      realEmail: z.string().trim().email().max(255),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      password: z.string().min(6).max(72),
      sponsorCode: z.string().trim().max(20).optional().default(""),
      position: z.enum(["left", "right"]),
      activate: z.boolean().default(false),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("register_member", {
      _full_name: data.fullName,
      _mobile: data.mobile,
      _real_email: data.realEmail,
      _dob: data.dob,
      _password: data.password,
      _sponsor_code: data.sponsorCode || "",
      _position: data.position,
      _activate: data.activate,
    } as any);
    if (error) throw new Error(error.message);
    const typed = result as unknown as { ok: boolean; memberCode: string; referralCode: string };
    if (!typed?.ok) throw new Error("Member creation failed");
    return typed;
  });

export const getMyDirectTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase.rpc("get_my_direct_team");
    if (error) throw error;
    return ((rows ?? []) as Array<{
      id: string;
      full_name: string;
      referral_code: string;
      member_position: string;
      created_at: string;
      is_active: boolean;
    }>).map((member) => ({
      id: member.id,
      full_name: member.full_name,
      referral_code: member.referral_code,
      member_position: member.member_position,
      created_at: member.created_at,
      is_active: member.is_active,
    }));
  });

export interface TreeNode {
  id: string;
  full_name: string;
  member_code: string;
  is_active: boolean;
  left: TreeNode | null;
  right: TreeNode | null;
}

export const getMyTree = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase.rpc("get_my_tree_rows");
    if (error) throw error;

    const typedRows = (rows ?? []) as Array<{
      id: string;
      full_name: string;
      member_code: string;
      parent_id: string | null;
      member_position: "left" | "right";
      is_active: boolean;
    }>;

    const byParent = new Map<string, { left?: typeof typedRows[0]; right?: typeof typedRows[0] }>();
    for (const row of typedRows) {
      const parent = row.parent_id ?? "";
      if (!byParent.has(parent)) byParent.set(parent, {});
      const bucket = byParent.get(parent)!;
      bucket[row.member_position] = row;
    }

    const build = (id: string, depth: number): TreeNode | undefined => {
      const self = typedRows.find((r) => r.id === id);
      if (!self) return undefined;
      const kids = byParent.get(id) ?? {};
      const left = kids.left ? build(kids.left.id, depth + 1) ?? null : null;
      const right = kids.right ? build(kids.right.id, depth + 1) ?? null : null;
      return {
        id: self.id,
        full_name: self.full_name,
        member_code: self.member_code,
        is_active: self.is_active,
        left,
        right,
      };
    };

    return build(context.userId, 0) ?? null;
  });

// Admin-only: approve or reject a pending order. On approval, DB function
// pays direct commission + walks up the tree to pay pair bonuses.
export const reviewOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      orderId: z.string().uuid(),
      action: z.enum(["approve", "reject"]),
      note: z.string().optional().default(""),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_review_order_hosted", {
      _order_id: data.orderId,
      _action: data.action,
      _note: data.note,
    });
    if (error) throw error;
    return { ok: true };
  });

export const reviewWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      withdrawalId: z.string().uuid(),
      action: z.enum(["approve", "reject"]),
      note: z.string().optional().default(""),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_review_withdrawal_hosted", {
      _withdrawal_id: data.withdrawalId,
      _action: data.action,
      _note: data.note,
    });
    if (error) throw error;
    return { ok: true };
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1),
      description: z.string().optional().default(""),
      image_url: z.string().min(1),
      category: z.string().min(1),
      mrp: z.number().nonnegative(),
      direct_commission: z.number().nonnegative(),
      pair_bonus: z.number().nonnegative(),
      stock: z.number().int().min(0),
      status: z.enum(["active", "inactive"]),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_upsert_product", {
      _id: data.id ?? null,
      _name: data.name,
      _description: data.description,
      _category: data.category,
      _image_url: data.image_url,
      _mrp: data.mrp,
      _direct_commission: data.direct_commission,
      _pair_bonus: data.pair_bonus,
      _stock: data.stock,
      _status: data.status,
    } as any);
    if (error) throw error;
    return { ok: true };
  });

export const updateMemberStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      userId: z.string().uuid(),
      account_status: z.enum(["Active", "Inactive", "Suspended", "Banned"]).optional(),
      is_active: z.boolean().optional(),
      kyc_status: z.enum(["pending", "approved", "rejected"]).optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_set_member_state", {
      _user_id: data.userId,
      _account_status: data.account_status ?? undefined,
      _is_active: data.is_active ?? undefined,
      _kyc_status: data.kyc_status ?? undefined,
    });
    if (error) throw error;
    return { ok: true };
  });

export const adminSetAccountState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      userId: z.string().uuid(),
      account_status: z.enum(["Active", "Inactive", "Suspended", "Banned"]),
      is_active: z.boolean(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_set_member_state", {
      _user_id: data.userId,
      _account_status: data.account_status,
      _is_active: data.is_active,
      _kyc_status: undefined,
    });
    if (error) throw error;
    return { ok: true };
  });

export const updatePlanSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      min_withdrawal: z.number().nonnegative(),
      tds_percent: z.number().min(0).max(100),
      admin_charge: z.number().nonnegative(),
      withdrawal_days: z.number().int().nonnegative(),
      daily_pair_cap: z.number().int().nonnegative(),
      refund_days: z.number().int().nonnegative(),
      monthly_repurchase: z.boolean(),
      upi_id: z.string().min(1),
      payment_account_name: z.string().min(1),
      qr_image_url: z.string().optional().nullable(),
      qr_image_path: z.string().optional().nullable(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_update_plan_settings", {
      _min_withdrawal: data.min_withdrawal,
      _tds_percent: data.tds_percent,
      _admin_charge: data.admin_charge,
      _withdrawal_days: data.withdrawal_days,
      _daily_pair_cap: data.daily_pair_cap,
      _refund_days: data.refund_days,
      _monthly_repurchase: data.monthly_repurchase,
      _upi_id: data.upi_id,
      _payment_account_name: data.payment_account_name,
      _qr_image_url: data.qr_image_url ?? undefined,
      _qr_image_path: data.qr_image_path ?? undefined,
    } as any);
    if (error) throw error;
    return { ok: true };
  });

export const resetMemberPassword = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({
      mobile: z.string().regex(/^[6-9][0-9]{9}$/),
      email: z.string().trim().email(),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      newPassword: z.string().min(6).max(72),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const supabase = await getAnonSupabase();
    const { error } = await supabase.rpc("reset_member_password", {
      _mobile: data.mobile,
      _email: data.email,
      _dob: data.dob,
      _new_password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetMemberPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      userId: z.string().uuid(),
      newPassword: z.string().min(6).max(72),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_set_member_password", {
      _user_id: data.userId,
      _new_password: data.newPassword,
    });
    if (error) throw error;
    return { ok: true };
  });

export const claimMyReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      level: z.number().int().min(1).max(18),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("claim_my_reward", {
      _level: data.level,
    });
    if (error) throw error;
    return { ok: true };
  });

export const expireMyRewards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.rpc("expire_my_rewards");
    if (error) throw error;
    return { ok: true };
  });
