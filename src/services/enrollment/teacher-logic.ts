import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const TeacherService = {
  /**
   * Logic: Onboard a new KMTC Lecturer
   * Validates email and formats department for consistent UI grouping
   */
  async enrollTeacher(payload: { full_name: string; email: string; department: string }) {
    // 1. Data Sanitization (SaaS Best Practice)
    const cleanEmail = payload.email.toLowerCase().trim();
    const cleanName = payload.full_name.trim();
    
    // 2. Business Rule: Ensure department names are consistent
    // Prevents having "nursing" and "Nursing" as two different departments
    const formattedDept = payload.department.charAt(0).toUpperCase() + payload.department.slice(1).toLowerCase();

    // 3. Database Operation
    const { data, error } = await supabase
      .from("teachers")
      .insert([{ 
        full_name: cleanName, 
        email: cleanEmail, 
        department: formattedDept 
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error("This email is already registered to a staff member.");
      throw error;
    }

    return data;
  },

  /**
   * Logic: Fetch teachers grouped by department
   * Useful for the HOD to quickly find staff in their own section
   */
  async getTeachersByDept(dept: string) {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("department", dept)
      .order("full_name", { ascending: true });

    if (error) throw error;
    return data;
  }
};