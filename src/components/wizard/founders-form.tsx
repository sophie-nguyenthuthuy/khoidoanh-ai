"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveFoundersAction } from "@/server/actions/registration-actions";

interface LegalRepDraft {
  fullName: string;
  title: string;
  idType: "CCCD" | "PASSPORT";
  idNumber: string;
  idIssuedDate: string;
  idIssuedPlace: string;
  permanentAddress: string;
  contactAddress: string;
  phone: string;
  email: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  nationality: string;
}

interface MemberDraft {
  fullName: string;
  idNumber?: string;
  address: string;
  contributionVnd: number;
  contributionPct: number;
  isOrganization: boolean;
}

interface Props {
  registrationId: string;
  entityType: string;
  needsMembers: boolean;
  defaultLegalRep?: Partial<LegalRepDraft>;
  defaultMembers: Array<{
    fullName: string;
    idNumber?: string | null;
    address?: string | null;
    contributionVnd?: number | null;
    contributionPct?: number | null;
    isOrganization?: boolean | null;
  }>;
}

export function FoundersForm({
  registrationId,
  needsMembers,
  defaultLegalRep,
  defaultMembers,
}: Props) {
  const [legalRep, setLegalRep] = useState<LegalRepDraft>({
    fullName: defaultLegalRep?.fullName ?? "",
    title: defaultLegalRep?.title ?? "Giám đốc",
    idType: defaultLegalRep?.idType ?? "CCCD",
    idNumber: defaultLegalRep?.idNumber ?? "",
    idIssuedDate: defaultLegalRep?.idIssuedDate ?? "",
    idIssuedPlace: defaultLegalRep?.idIssuedPlace ?? "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
    permanentAddress: defaultLegalRep?.permanentAddress ?? "",
    contactAddress: defaultLegalRep?.contactAddress ?? "",
    phone: defaultLegalRep?.phone ?? "",
    email: defaultLegalRep?.email ?? "",
    gender: defaultLegalRep?.gender ?? "MALE",
    dateOfBirth: defaultLegalRep?.dateOfBirth ?? "",
    nationality: defaultLegalRep?.nationality ?? "Việt Nam",
  });

  const [members, setMembers] = useState<MemberDraft[]>(
    defaultMembers.map((m) => ({
      fullName: m.fullName,
      idNumber: m.idNumber ?? "",
      address: m.address ?? "",
      contributionVnd: m.contributionVnd ?? 0,
      contributionPct: m.contributionPct ?? 0,
      isOrganization: m.isOrganization ?? false,
    })),
  );

  const [pending, startTransition] = useTransition();

  function addMember() {
    setMembers((p) => [
      ...p,
      { fullName: "", idNumber: "", address: "", contributionVnd: 0, contributionPct: 0, isOrganization: false },
    ]);
  }
  function updateMember(i: number, patch: Partial<MemberDraft>) {
    setMembers((p) => p.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }
  function removeMember(i: number) {
    setMembers((p) => p.filter((_, idx) => idx !== i));
  }

  function submit() {
    const totalPct = members.reduce((sum, m) => sum + m.contributionPct, 0);
    if (needsMembers && Math.abs(totalPct - 10000) > 1) {
      toast.error(`Tổng tỷ lệ phải = 100%. Hiện tại: ${(totalPct / 100).toFixed(2)}%`);
      return;
    }

    startTransition(async () => {
      try {
        await saveFoundersAction({
          id: registrationId,
          legalRepresentative: legalRep,
          members: needsMembers
            ? members.map((m) => ({
                fullName: m.fullName,
                isOrganization: m.isOrganization,
                idNumber: m.idNumber || undefined,
                idType: "CCCD",
                nationality: "Việt Nam",
                address: m.address,
                contributionVnd: m.contributionVnd,
                contributionPct: m.contributionPct,
              }))
            : undefined,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Người đại diện theo pháp luật</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Họ và tên *</Label>
            <Input
              value={legalRep.fullName}
              onChange={(e) => setLegalRep({ ...legalRep, fullName: e.target.value })}
            />
          </div>
          <div>
            <Label>Chức danh *</Label>
            <Input
              value={legalRep.title}
              onChange={(e) => setLegalRep({ ...legalRep, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Loại giấy tờ</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={legalRep.idType}
              onChange={(e) =>
                setLegalRep({ ...legalRep, idType: e.target.value as "CCCD" | "PASSPORT" })
              }
            >
              <option value="CCCD">CCCD/CMND</option>
              <option value="PASSPORT">Hộ chiếu</option>
            </select>
          </div>
          <div>
            <Label>Số {legalRep.idType === "CCCD" ? "CCCD/CMND" : "hộ chiếu"} *</Label>
            <Input
              value={legalRep.idNumber}
              onChange={(e) => setLegalRep({ ...legalRep, idNumber: e.target.value })}
            />
          </div>
          <div>
            <Label>Ngày cấp *</Label>
            <Input
              type="date"
              value={legalRep.idIssuedDate}
              onChange={(e) => setLegalRep({ ...legalRep, idIssuedDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Ngày sinh *</Label>
            <Input
              type="date"
              value={legalRep.dateOfBirth}
              onChange={(e) => setLegalRep({ ...legalRep, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <Label>Giới tính</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={legalRep.gender}
              onChange={(e) => setLegalRep({ ...legalRep, gender: e.target.value as "MALE" | "FEMALE" })}
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>Địa chỉ thường trú *</Label>
            <Input
              value={legalRep.permanentAddress}
              onChange={(e) => setLegalRep({ ...legalRep, permanentAddress: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Địa chỉ liên hệ *</Label>
            <Input
              value={legalRep.contactAddress}
              onChange={(e) => setLegalRep({ ...legalRep, contactAddress: e.target.value })}
            />
          </div>
          <div>
            <Label>Số điện thoại *</Label>
            <Input
              value={legalRep.phone}
              onChange={(e) => setLegalRep({ ...legalRep, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={legalRep.email}
              onChange={(e) => setLegalRep({ ...legalRep, email: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {needsMembers && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Thành viên góp vốn</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addMember}>
              <Plus className="size-4" /> Thêm
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.map((m, i) => (
              <div key={i} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thành viên {i + 1}</span>
                  <button type="button" onClick={() => removeMember(i)}>
                    <Trash2 className="size-4 text-destructive" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Họ tên"
                    value={m.fullName}
                    onChange={(e) => updateMember(i, { fullName: e.target.value })}
                  />
                  <Input
                    placeholder="CCCD"
                    value={m.idNumber ?? ""}
                    onChange={(e) => updateMember(i, { idNumber: e.target.value })}
                  />
                  <Input
                    placeholder="Địa chỉ"
                    value={m.address}
                    onChange={(e) => updateMember(i, { address: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Vốn góp (VNĐ)"
                    value={m.contributionVnd}
                    onChange={(e) => updateMember(i, { contributionVnd: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Tỷ lệ (%)"
                    value={m.contributionPct / 100}
                    onChange={(e) =>
                      updateMember(i, { contributionPct: Math.round(Number(e.target.value) * 100) })
                    }
                  />
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">Chưa có thành viên</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Đang lưu…" : "Tiếp tục → Sinh điều lệ"}
        </Button>
      </div>
    </div>
  );
}
