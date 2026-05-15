"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatVnd, numberToVietnameseText } from "@/lib/utils";
import { companyInfoSchema, type CompanyInfo } from "@/lib/validations/registration";
import { saveCompanyInfoAction } from "@/server/actions/registration-actions";

interface Props {
  registrationId: string;
  entityType: string;
  defaultValues: CompanyInfo;
  provinces: ReadonlyArray<{ code: string; name: string }>;
}

export function CompanyInfoForm({ registrationId, defaultValues, provinces }: Props) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyInfo>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues,
  });

  const capital = watch("charterCapitalVnd");

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      try {
        await saveCompanyInfoAction({ id: registrationId, data });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Tên doanh nghiệp</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="proposedName">Tên đầy đủ tiếng Việt *</Label>
            <Input id="proposedName" placeholder="Công ty TNHH ABC" {...register("proposedName")} />
            {errors.proposedName && <p className="mt-1 text-xs text-destructive">{errors.proposedName.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proposedNameEn">Tên tiếng Anh</Label>
              <Input id="proposedNameEn" placeholder="ABC Company Limited" {...register("proposedNameEn")} />
            </div>
            <div>
              <Label htmlFor="proposedNameAbbr">Tên viết tắt</Label>
              <Input id="proposedNameAbbr" placeholder="ABC CO." {...register("proposedNameAbbr")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Vốn điều lệ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="charterCapitalVnd">Số vốn điều lệ (VNĐ) *</Label>
            <Input
              id="charterCapitalVnd"
              type="number"
              min={1_000_000}
              step={1_000_000}
              placeholder="1000000000"
              {...register("charterCapitalVnd", { valueAsNumber: true })}
            />
            {capital > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatVnd(capital)} ({numberToVietnameseText(capital)})
              </p>
            )}
            {errors.charterCapitalVnd && (
              <p className="mt-1 text-xs text-destructive">{errors.charterCapitalVnd.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Trụ sở chính</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="streetAddress">Số nhà, đường *</Label>
            <Input id="streetAddress" {...register("headquartersAddress.streetAddress")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="ward">Phường/Xã *</Label>
              <Input id="ward" {...register("headquartersAddress.ward")} />
            </div>
            <div>
              <Label htmlFor="district">Quận/Huyện *</Label>
              <Input id="district" {...register("headquartersAddress.district")} />
            </div>
            <div>
              <Label htmlFor="province">Tỉnh/TP *</Label>
              <select
                id="province"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => {
                  const p = provinces.find((x) => x.code === e.target.value);
                  setValue("headquartersAddress.provinceCode", e.target.value);
                  setValue("headquartersAddress.province", p?.name ?? "");
                }}
              >
                <option value="">— Chọn tỉnh —</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : "Tiếp tục → Mã ngành"}
        </Button>
      </div>
    </form>
  );
}
