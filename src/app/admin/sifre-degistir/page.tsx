import { redirect } from "next/navigation";

export default function AdminPasswordRedirect() {
  redirect("/admin/");
}
