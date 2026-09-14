import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Mobile number is the login credential. It is mapped to a synthetic auth email
// (<mobile>@rs.local) so one real Gmail can be reused across many member accounts.
export const registerMember = createServerFn({ method: "POST" })
  .inputValidator((d) =>
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const syntheticEmail = `${data.mobile}@rs.local`;
    const { data: existing } = await supabaseAdmin
      .from("profiles").select("id").eq("username", data.mobile).maybeSingle();
    if (existing) throw new Error("This mobile number is already registered");


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
        phone: data.mobile,
        username: data.mobile,
        real_email: data.realEmail,
        sponsor_code: data.sponsorCode,
        position: data.position,
      },
    });
    if (authError || !created.user) throw authError ?? new Error("Could not create member");

    try {
      const userId = created.user.id;
      const { data: referralCode, error: codeError } = await supabaseAdmin.rpc("generate_referral_code");
      if (codeError || !referralCode) throw codeError ?? new Error("Could not generate referral code");
      const { data: memberCode, error: memberCodeError } = await supabaseAdmin.rpc("generate_member_code");
      if (memberCodeError || !memberCode) throw memberCodeError ?? new Error("Could not generate member ID");
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: userId,
        full_name: data.fullName,
        phone: data.mobile,
        email: data.realEmail,
        username: data.mobile,
        dob: data.dob,
        member_code: memberCode,
        referral_code: referralCode,
        sponsor_id: sponsorId,
        parent_id: parentId,
        position: sponsorId ? data.position : null,
        is_active: false,
        login_password: data.password,
      }, { onConflict: "id" });
      if (profileError) throw profileError;
      await Promise.all([
        supabaseAdmin.from("wallets").upsert({ user_id: userId }, { onConflict: "user_id" }),
        supabaseAdmin.from("tree_stats").upsert({ user_id: userId }, { onConflict: "user_id" }),
        supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "member" }, { onConflict: "user_id,role" }),
      ]);
      return { ok: true, memberCode, referralCode };
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

// Self-service password reset for members. Member accounts use a synthetic
// login email, so instead of a mail link we verify identity with the details
// captured at registration (registered email + date of birth).
export const resetMemberPassword = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      mobile: z.string().regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit mobile number"),
      email: z.string().trim().email(),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      newPassword: z.string().min(6).max(72),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id,email,dob")
      .eq("username", data.mobile)
      .maybeSingle();
    if (error) throw error;
    if (
      !profile ||
      (profile.email ?? "").trim().toLowerCase() !== data.email.trim().toLowerCase() ||
      profile.dob !== data.dob
    ) {
      throw new Error("Details do not match our records. Please contact support.");
    }
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      password: data.newPassword,
    });
    if (updateError) throw updateError;
    await supabaseAdmin.from("profiles").update({ login_password: data.newPassword }).eq("id", profile.id);
    return { ok: true };
  });

// Deep binary downline for the tree view (both legs, up to 10 levels).
export type TreeNode = {
  id: string;
  full_name: string;
  member_code: string;
  position: string | null;
  is_active: boolean;
  left: TreeNode | null;
  right: TreeNode | null;
};

export const getMyTree = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TreeNode | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id,full_name,member_code,parent_id,position,is_active");
    if (error) throw error;
    const rows = data ?? [];
    const byParent = new Map<string, typeof rows>();
    for (const row of rows) {
      if (!row.parent_id) continue;
      const list = byParent.get(row.parent_id) ?? [];
      list.push(row);
      byParent.set(row.parent_id, list);
    }
    function build(id: string, depth: number): TreeNode | null {
      const self = rows.find((r) => r.id === id);
      if (!self) return null;
      const kids = depth >= 10 ? [] : byParent.get(id) ?? [];
      const leftKid = kids.find((k) => k.position === "left");
      const rightKid = kids.find((k) => k.position === "right");
      return {
        id: self.id,
        full_name: self.full_name,
        member_code: self.member_code,
        position: self.position,
        is_active: self.is_active,
        left: leftKid ? build(leftKid.id, depth + 1) : null,
        right: rightKid ? build(rightKid.id, depth + 1) : null,
      };
    }
    return build(context.userId, 0);
  });

// ---------------------------------------------------------------------------
// Admin member management (manual add, status control, password reset)
// ---------------------------------------------------------------------------

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

// Admin-only: create a member account manually from the admin panel.
export const adminAddMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      fullName: z.string().trim().min(2).max(100),
      mobile: z.string().regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit mobile number"),
      realEmail: z.string().trim().email().max(255),
      dob: z.string().optional().default("").transform((v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null)),
      password: z.string().min(6).max(72),
      sponsorCode: z.string().trim().max(20).default(""),
      position: z.enum(["left", "right"]).default("left"),
      activate: z.boolean().default(false),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const syntheticEmail = `${data.mobile}@rs.local`;

    const { data: existing } = await supabaseAdmin
      .from("profiles").select("id").eq("phone", data.mobile).maybeSingle();
    if (existing) throw new Error("This mobile number is already registered");

    let sponsorId: string | null = null;
    let parentId: string | null = null;
    if (data.sponsorCode) {
      const { data: sponsor } = await supabaseAdmin
        .from("profiles").select("id").eq("referral_code", data.sponsorCode).maybeSingle();
      if (!sponsor) throw new Error("Sponsor code is not valid");
      sponsorId = sponsor.id;
      parentId = sponsor.id;
      while (parentId) {
        const { data: child }: { data: { id: string } | null } = await supabaseAdmin
          .from("profiles").select("id").eq("parent_id", parentId).eq("position", data.position).maybeSingle();
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
        phone: data.mobile,
        username: data.mobile,
        real_email: data.realEmail,
        sponsor_code: data.sponsorCode,
        position: data.position,
      },
    });
    if (authError || !created.user) throw authError ?? new Error("Could not create member");

    try {
      const userId = created.user.id;
      const { data: referralCode } = await supabaseAdmin.rpc("generate_referral_code");
      const { data: memberCode } = await supabaseAdmin.rpc("generate_member_code");
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: userId,
        full_name: data.fullName,
        phone: data.mobile,
        email: data.realEmail,
        username: data.mobile,
        dob: data.dob,
        member_code: memberCode as string,
        referral_code: referralCode as string,
        sponsor_id: sponsorId,
        parent_id: parentId,
        position: sponsorId ? data.position : null,
        is_active: data.activate,
        account_status: "active",
        login_password: data.password,
      }, { onConflict: "id" });
      if (profileError) throw profileError;
      await Promise.all([
        supabaseAdmin.from("wallets").upsert({ user_id: userId }, { onConflict: "user_id" }),
        supabaseAdmin.from("tree_stats").upsert({ user_id: userId }, { onConflict: "user_id" }),
        supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "member" }, { onConflict: "user_id,role" }),
      ]);
      return { ok: true, memberCode: memberCode as string, referralCode: referralCode as string };
    } catch (setupError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw setupError;
    }
  });

// Admin-only: change a member's account status (active / inactive / suspended / banned)
// and/or activate their ID (paid status) manually.
export const adminSetAccountState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      userId: z.string().uuid(),
      account_status: z.enum(["active", "inactive", "suspended", "banned"]).optional(),
      is_active: z.boolean().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { account_status?: string; is_active?: boolean } = {};
    if (data.account_status) patch.account_status = data.account_status;
    if (typeof data.is_active === "boolean") patch.is_active = data.is_active;
    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
    if (error) throw error;
    return { ok: true };
  });

// Admin-only: set a new login password for a member (stored so admin can see it).
export const adminSetMemberPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ userId: z.string().uuid(), newPassword: z.string().min(6).max(72) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) throw error;
    const { error: profileError } = await supabaseAdmin
      .from("profiles").update({ login_password: data.newPassword }).eq("id", data.userId);
    if (profileError) throw profileError;
    return { ok: true };
  });

// Member: claim an achieved reward within the 7-day window.
export const claimMyReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ level: z.number().int().positive() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("claim_reward", {
      _user_id: context.userId,
      _level: data.level,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Member: mark overdue rewards as expired (called when the rewards tab loads).
export const expireMyRewards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("expire_due_rewards", { _user_id: context.userId });
    return { ok: true };
  });
