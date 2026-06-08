import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/middleware";

type RouteContext = { params: Promise<{ taskId: string }> };

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { user, errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const { taskId } = params;
    const deletedTask = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user!.userId)))
      .returning();

    if (deletedTask.length === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Task Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { user, errorResponse } = requireAuth(req);
    if (errorResponse) return errorResponse;
    const params = await context.params;
    const { taskId } = params;
    const body = await req.json();

    const updatedTask = await db
      .update(tasks)
      .set({
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.status && { status: body.status }),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user!.userId)))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Task updated successfully", task: updatedTask[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update Task Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
