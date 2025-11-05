/**
 * POST /api/auth/reset-password
 *
 * Complete password reset with new password
 */

import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { resetPassword } from "@/lib/auth/service";
import { resetPasswordSchema } from "./_schemas";
import type { ErrorResponse, ResetPasswordResponseDto } from "@/types";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const errorResponse: ErrorResponse = {
        error: {
          code: "validation_error",
          message: validation.error.errors[0]?.message || "Invalid request data",
          details: { errors: validation.error.errors },
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { password, token } = validation.data;

    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    // Verify the recovery token using verifyOtp
    // This will create a session if the token is valid
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (verifyError || !verifyData.user) {
      // Token is invalid or expired
      const errorResponse: ErrorResponse = {
        error: {
          code: "unauthorized",
          message: "This reset link is invalid or expired. Please request a new one.",
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify we have a valid user session after token verification
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      // Session not properly established after token verification
      const errorResponse: ErrorResponse = {
        error: {
          code: "unauthorized",
          message: "This reset link is invalid or expired. Please request a new one.",
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Attempt to reset password
    // The resetPassword service uses updateUser which requires a valid session
    // If the token is valid, the session should contain the recovery token
    const result = await resetPassword(supabase, password);

    if (!result.success) {
      // Check if it's a token-related error
      const isTokenError =
        result.error?.toLowerCase().includes("token") ||
        result.error?.toLowerCase().includes("expired") ||
        result.error?.toLowerCase().includes("invalid");

      const errorResponse: ErrorResponse = {
        error: {
          code: isTokenError ? "unauthorized" : "validation_error",
          message: isTokenError
            ? "This reset link is invalid or expired. Please request a new one."
            : result.error || "Failed to reset password. Please try again.",
        },
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Success - password has been reset
    const response: ResetPasswordResponseDto = {
      message: "Password successfully reset. Please log in with your new password.",
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    const errorResponse: ErrorResponse = {
      error: {
        code: "internal",
        message: "An unexpected error occurred",
      },
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
