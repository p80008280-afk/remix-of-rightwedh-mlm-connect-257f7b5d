import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const registerMember = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      fullName: z.string().min(2).max(100),
      username: z.string().regex(/^[a-z0-9._-]{3,24}$/),
      realEmail: z.string().email(),
      phone: z.string().min(6).max(20),
      password: z.string().min(6).max(72),
      sponsorCode: z.string().max(20).default(""),
      position: z.enum(["left", "right"]),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const syntheticEmail = `${data.username}@rs.local`;
    const { data: existing } = await supabaseAdmin.from("profiles").select("id").eq("username", data.username).maybeSingle();
    if (existing) throw new Error("Username already taken");

    let sponsorId: string | null = null;
    let parentId: string | null = null;
    if (data.sponsorCode) {
      const { data: sponsor, error: sponsorError } = await supabaseAdmin
        .from("profiles").select("id").eq("referral_code", data.sponsorCode).maybeSingle();
      if (sponsorError) throw sponsorError;
      if (!sponsor) throw new Error("Sponsor code is not valid");
      sponsorId = sponsor.id;
      parentId = sponsor.id;
      while (parentId) {
        const { data: child, error: childError }: { data: { id: string } | null; error: Error | null } = await supabaseAdmin
          .from("profiles").select("id").eq("parent_id", parentId).eq("position", data.position).maybeSingle();
        if (childError) throw childError;
        if (!child) break;
        parentId = child.id;
      }
    }

    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        phone: data.phone,
        username: data.username,
        real_email: data.realEmail,
        sponsor_code: data.sponsorCode,
        position: data.position,
      },
    });
    if (authError || !created.user) throw authError ?? new Error("Could not create member");

    try {
      const { data: referralCode, error: codeError } = await supabaseAdmin.rpc("generate_referral_code");
      if (codeError || !referralCode) throw codeError ?? new Error("Could not generate referral code");
      const userId = created.user.id;
      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        full_name: data.fullName,
        phone: data.phone,
        email: data.realEmail,
        username: data.username,
        referral_code: referralCode,
        sponsor_id: sponsorId,
        parent_id: parentId,
        position: sponsorId ? data.position : null,
        is_active: false,
      });
      if (profileError) throw profileError;
      const [wallet, stats, role] = await Promise.all([
        supabaseAdmin.from("wallets").insert({ user_id: userId }),
        supabaseAdmin.from("tree_stats").insert({ user_id: userId }),
        supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "member" }),
      ]);
      const setupError = wallet.error ?? stats.error ?? role.error;
      if (setupError) throw setupError;
      return { ok: true };
    } catch (setupError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw setupError;
    }
  });

export const getMyDirectTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id,full_name,referral_code,position,created_at,is_active")
      .eq("sponsor_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((member) => ({
      id: member.id,
      full_name: member.full_name,
      referral_code: member.referral_code,
      member_position: member.position,
      created_at: member.created_at,
      is_active: member.is_active,
    }));
  });

// Admin-only: approve or reject a pending order. On approval, DB function
// pays direct commission + walks up the tree to pay pair bonuses.
export const reviewOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      orderId: z.string().uuid(),
      action: z.enum(["approve", "reject"]),
      note: z.string().optional().default(""),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("admin_review_order", {
      _order_id: data.orderId,
      _action: data.action,
      _note: data.note,
    });
    if (error) throw error;
    return { ok: true };
  });

// Admin-only: approve or reject a withdrawal request.
export const reviewWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      withdrawalId: z.string().uuid(),
      action: z.enum(["approve", "reject"]),
      note: z.string().optional().default(""),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("admin_review_withdrawal", {
      _withdrawal_id: data.withdrawalId,
      _action: data.action,
      _note: data.note,
    });
    if (error) throw error;
    return { ok: true };
  });

// Admin-only: create or update a product.
export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1),
      description: z.string().default(""),
      category: z.string().default("General"),
      image_url: z.string().default(""),
      mrp: z.number().nonnegative(),
      direct_commission: z.number().nonnegative(),
      pair_bonus: z.number().nonnegative(),
      stock: z.number().int().nonnegative(),
      status: z.enum(["active", "inactive"]).default("active"),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await supabaseAdmin.from("products").update(rest).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.from("products").insert(data);
      if (error) throw error;
    }
    return { ok: true };
  });

// Admin-only: update KYC / active status on a member.
export const updateMemberStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      userId: z.string().uuid(),
      kyc_status: z.enum(["pending", "approved", "rejected"]).optional(),
      is_active: z.boolean().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { kyc_status?: string; is_active?: boolean } = {};
    if (data.kyc_status) patch.kyc_status = data.kyc_status;
    if (typeof data.is_active === "boolean") patch.is_active = data.is_active;
    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
    if (error) throw error;
    return { ok: true };
  });

// Admin-only: update payment and plan settings shown during checkout.
export const updatePlanSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      min_withdrawal: z.number().nonnegative(),
      tds_percent: z.number().nonnegative(),
      admin_charge: z.number().nonnegative(),
      withdrawal_days: z.number().int().nonnegative(),
      daily_pair_cap: z.number().int().nonnegative(),
      refund_days: z.number().int().nonnegative(),
      monthly_repurchase: z.boolean(),
      upi_id: z.string().min(3),
      payment_account_name: z.string().min(1),
      qr_image_url: z.string().min(1),
      qr_image_path: z.string().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("plan_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw error;
    return { ok: true };
  });
