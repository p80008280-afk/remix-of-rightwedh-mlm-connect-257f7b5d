import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
    const newStatus = data.action === "approve" ? "approved" : "rejected";
    const { error: upErr } = await supabaseAdmin
      .from("orders")
      .update({ status: newStatus, admin_note: data.note, processed_at: new Date().toISOString() })
      .eq("id", data.orderId);
    if (upErr) throw upErr;

    if (data.action === "approve") {
      const { error: rpcErr } = await supabaseAdmin.rpc("process_order_approval", {
        _order_id: data.orderId,
      });
      if (rpcErr) throw rpcErr;
    }
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
    const newStatus = data.action === "approve" ? "approved" : "rejected";
    const { error: upErr } = await supabaseAdmin
      .from("withdrawals")
      .update({ status: newStatus, admin_note: data.note, processed_at: new Date().toISOString() })
      .eq("id", data.withdrawalId);
    if (upErr) throw upErr;

    if (data.action === "approve") {
      const { error: rpcErr } = await supabaseAdmin.rpc("process_withdrawal_approval", {
        _withdrawal_id: data.withdrawalId,
      });
      if (rpcErr) throw rpcErr;
    }
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
    const patch: Record<string, unknown> = {};
    if (data.kyc_status) patch.kyc_status = data.kyc_status;
    if (typeof data.is_active === "boolean") patch.is_active = data.is_active;
    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
    if (error) throw error;
    return { ok: true };
  });
