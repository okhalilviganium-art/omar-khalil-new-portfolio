export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          img: string;
          tags: string;
          description: string;
          role: string;
          year: string;
          stack: string;
          live: string;
          overlay_tag: string;
          overlay_name: string;
          gallery_images: string;
          featured: boolean;
          github_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          img?: string;
          tags?: string;
          description?: string;
          role?: string;
          year?: string;
          stack?: string;
          live?: string;
          overlay_tag?: string;
          overlay_name?: string;
          gallery_images?: string;
          featured?: boolean;
          github_url?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          img?: string;
          tags?: string;
          description?: string;
          role?: string;
          year?: string;
          stack?: string;
          live?: string;
          overlay_tag?: string;
          overlay_name?: string;
          gallery_images?: string;
          featured?: boolean;
          github_url?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          icon: string;
          name: string;
          description: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          icon?: string;
          name: string;
          description?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          icon?: string;
          name?: string;
          description?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          date: string;
          status: "unread" | "read" | "replied" | "archived";
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string;
          message: string;
          date?: string;
          status?: "unread" | "read" | "replied" | "archived";
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          date?: string;
          status?: "unread" | "read" | "replied" | "archived";
          is_read?: boolean;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          icon: string;
          url: string;
          title: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          icon?: string;
          url: string;
          title?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          icon?: string;
          url?: string;
          title?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      statistics: {
        Row: {
          id: string;
          stat_type: "card" | "bar";
          name: string;
          number_val: number | null;
          pct: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          stat_type: "card" | "bar";
          name: string;
          number_val?: number | null;
          pct?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          stat_type?: "card" | "bar";
          name?: string;
          number_val?: number | null;
          pct?: number | null;
          sort_order?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
