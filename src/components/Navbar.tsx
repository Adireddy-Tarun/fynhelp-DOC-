import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import {
  Menu,
  X,
  ChevronDown,
  Store,
  Briefcase,
  PlayCircle,
  FileSearch,
  GitCompareArrows,
  PenLine,
  Send,
  Rocket,
  ShoppingBag,
  Factory,
  ShieldCheck,
  LayoutDashboard,
  FileStack,
  MessageSquare,
  Tag,
} from "lucide-react";
import FynLogo from "@/components/FynLogo";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/adminEmails";
