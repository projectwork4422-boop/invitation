import { NextRequest, NextResponse } from "next/server";
import { saveRsvp, checkExistingRsvp, getAllRsvps, deleteRsvp } from "@/lib/db";

// Ensure this route handler is executed dynamically on every request in production/serverless
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload. Please submit valid form data." },
        { status: 400 }
      );
    }

    const { guest_name, attendance, guest_count, message } = body || {};

    // Validation
    if (!guest_name || typeof guest_name !== "string" || guest_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (guest_name.trim().length > 100) {
      return NextResponse.json(
        { error: "Guest name cannot exceed 100 characters." },
        { status: 400 }
      );
    }

    if (attendance !== "attending" && attendance !== "declined") {
      return NextResponse.json(
        { error: "Please select your attendance status." },
        { status: 400 }
      );
    }

    let parsedGuestCount = 1;
    if (attendance === "attending") {
      parsedGuestCount = parseInt(guest_count, 10);
      if (isNaN(parsedGuestCount) || parsedGuestCount < 1 || parsedGuestCount > 20) {
        return NextResponse.json(
          { error: "Please specify a valid number of guests (1-20)." },
          { status: 400 }
        );
      }
    } else {
      parsedGuestCount = 0;
    }

    if (message && typeof message === "string" && message.trim().length > 1000) {
      return NextResponse.json(
        { error: "Message cannot exceed 1,000 characters." },
        { status: 400 }
      );
    }

    // Duplicate check
    const isDuplicate = await checkExistingRsvp(guest_name);
    if (isDuplicate) {
      return NextResponse.json(
        {
          error: `An RSVP for "${guest_name.trim()}" has already been received recently. If you wish to update your response, please contact the family directly.`,
          isDuplicate: true,
        },
        { status: 409 }
      );
    }

    // IP address extraction
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip_address = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    // Save RSVP
    const result = await saveRsvp({
      guest_name: guest_name.trim(),
      attendance,
      guest_count: parsedGuestCount,
      message: message ? message.trim() : null,
      ip_address,
    });

    const successMessage =
      attendance === "attending"
        ? `Alhamdulillah! Jazāk Allāhu Khayran, ${guest_name.trim()}. We eagerly look forward to welcoming you and your family to celebrate our special day!`
        : `Please remember us in your duas and pray for our marriage.`;

    return NextResponse.json({
      success: true,
      message: successMessage,
      rsvp: result.rsvp,
      storage: result.storage,
    });
  } catch (error) {
    console.error("RSVP submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP. Please try again in a moment." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await getAllRsvps();
    return NextResponse.json({
      success: true,
      rsvps: data.rsvps,
      stats: data.stats,
      storageType: data.storageType,
    });
  } catch (error) {
    console.error("Error fetching RSVP responses:", error);
    return NextResponse.json(
      { error: "Could not retrieve RSVP responses." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Missing response ID to delete." },
        { status: 400 }
      );
    }

    const numericId = parseInt(String(id), 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid response ID format." },
        { status: 400 }
      );
    }

    const result = await deleteRsvp(numericId);
    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to delete response." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Response deleted successfully.",
      storage: result.storage,
    });
  } catch (error) {
    console.error("Error deleting RSVP:", error);
    return NextResponse.json(
      { error: "Internal server error deleting response." },
      { status: 500 }
    );
  }
}
