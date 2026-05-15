import { Building2, Briefcase, Store, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { startRegistrationAction } from "@/server/actions/registration-actions";

const OPTIONS = [
  {
    code: "LLC_SINGLE",
    icon: Building2,
    title: "TNHH Một thành viên",
    description: "Phổ biến nhất cho solo founder. Chủ sở hữu duy nhất, trách nhiệm hữu hạn.",
    pros: ["Trách nhiệm hữu hạn", "1 chủ sở hữu", "Linh hoạt quản trị"],
  },
  {
    code: "LLC_MULTI",
    icon: Users,
    title: "TNHH Hai thành viên trở lên",
    description: "2-50 thành viên cùng góp vốn. Phù hợp đồng sáng lập.",
    pros: ["2-50 thành viên", "Trách nhiệm hữu hạn", "Tin cậy cao"],
  },
  {
    code: "JSC",
    icon: Briefcase,
    title: "Cổ phần",
    description: "Tối thiểu 3 cổ đông. Phát hành cổ phần dễ dàng — phù hợp gọi vốn.",
    pros: ["Gọi vốn linh hoạt", "Phát hành cổ phần", "Tối thiểu 3 cổ đông"],
  },
  {
    code: "HOUSEHOLD",
    icon: Store,
    title: "Hộ kinh doanh",
    description: "Cá nhân/gia đình. Đăng ký nhanh, đơn giản, thuế khoán.",
    pros: ["Đăng ký nhanh", "Thuế khoán", "Chi phí thấp"],
  },
] as const;

export default function EntityTypePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Chọn loại hình doanh nghiệp</h1>
        <p className="mt-2 text-muted-foreground">
          Bạn muốn thành lập loại hình nào? Có thể đổi sau ở các bước tiếp theo nếu cần.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <form key={opt.code} action={startRegistrationAction}>
            <input type="hidden" name="entityType" value={opt.code} />
            <Card className="cursor-pointer transition-colors hover:border-primary">
              <CardHeader>
                <div className="mb-1 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <opt.icon className="size-5" />
                </div>
                <CardTitle className="text-lg">{opt.title}</CardTitle>
                <CardDescription>{opt.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {opt.pros.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
                <Button type="submit" className="w-full">Chọn loại này</Button>
              </CardContent>
            </Card>
          </form>
        ))}
      </div>
    </div>
  );
}
