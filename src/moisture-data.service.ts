import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MoistureDataService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase URL or anon key is missing in environment variables.',
      );
    }
    // Initialize Supabase client
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async saveMoistureData(data: {
    name: string;
    moisture_pct: number;
    status_msg: string;
  }) {
    const { error } = await this.supabase.from('moisture_data').insert(data);
    if (error) throw new Error(error.message);
  }

  async getAllMoistureData() {
    const { data, error } = await this.supabase
      .from('moisture_data')
      .select('*');
    if (error) throw new Error(error.message);
    return data;
  }
}
