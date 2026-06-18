import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { showToast } from "@/stores/notificationStore";

export function MyPage() {
  const navigate = useNavigate();
  const { user, updateProfile, signout, withdraw } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setName(user.name);
    setEmail(user.email);
  }, [user]);

  if (!user) {
    return <div>사용자 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
      <Card className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Account Settings</h1>
          <p className="mt-1 text-sm text-mutedForeground">계정 정보를 관리할 수 있습니다.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-mutedForeground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-mutedForeground">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isSaving}
            onClick={async () => {
              try {
                setIsSaving(true);
                await updateProfile({ name, email });

                showToast({
                  title: "저장 완료",
                  description: "계정 정보가 저장되었습니다.",
                  tone: "success",
                });
              } catch (error) {
                showToast({
                  title: "저장 실패",
                  description: error instanceof Error ? error.message : "프로필 수정에 실패했습니다.",
                  tone: "error",
                });
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? "저장 중..." : "저장"}
          </Button>

          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await signout();
                showToast({
                  title: "로그아웃 완료",
                  description: "안전하게 로그아웃되었습니다.",
                  tone: "success",
                });
                navigate("/signin");
              } catch (error) {
                showToast({
                  title: "로그아웃 실패",
                  description: error instanceof Error ? error.message : "로그아웃에 실패했습니다.",
                  tone: "error",
                });
              }
            }}
          >
            로그아웃
          </Button>
        </div>
        {user?.userType === "USER" && (
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-fit" variant="destructive">회원 탈퇴</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <h3 className="text-lg font-semibold">정말 탈퇴하시겠습니까?</h3>
                <p className="mt-2 text-sm text-mutedForeground">회원 탈퇴 시 계정과 모든 데이터가 삭제되며, 복구할 수 없습니다.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await withdraw();
                        showToast({
                          title: "회원 탈퇴 완료",
                          description: "계정이 삭제되었습니다.",
                          tone: "success",
                        });
                        navigate("/signin");
                      } catch (error) {
                        showToast({
                          title: "회원 탈퇴 실패",
                          description: error instanceof Error ? error.message : "회원 탈퇴에 실패했습니다.",
                          tone: "error",
                        });
                      }
                    }}
                  >
                    탈퇴 진행
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </Card>
    </div>
  );
}

