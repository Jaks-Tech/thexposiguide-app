// Guard 
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const ConflictGuard = {
  /**
   * Checks if a teacher or a room is already occupied at a specific time.
   */
  async checkConflict(teacherId: string, roomName: string, day: string, time: string) {
    const { data, error } = await supabase
      .from("allocations")
      .select("id")
      .eq("day_of_week", day)
      .eq("start_time", time)
      // Check if EITHER the teacher OR the room is already taken
      .or(`teacher_id.eq.${teacherId},room_name.eq.${roomName}`);

    if (error) {
      console.error("Conflict Guard Error:", error);
      return false; 
    }

    return data && data.length > 0;
  }
};