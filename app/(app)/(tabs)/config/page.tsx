import { requireCurrentUser } from "@/lib/auth/session";
import { formatBirthdayFull, initials } from "@/lib/format";
import { ConfigToggles } from "@/components/config/ConfigToggles";
import { LogoutButton } from "@/components/config/LogoutButton";

export default async function ConfigPage() {
  const me = await requireCurrentUser();
  const prefs = me.notifPrefs;
  const theme = me.themePref as "claro" | "oscuro";

  return (
    <div className="px-[18px] pt-14 pb-[100px]">
      <h1 className="mx-1 font-[family-name:var(--font-display)] text-[40px] leading-none font-normal">
        Ajustes
      </h1>

      <div className="mt-4.5 flex items-center gap-3.5 rounded-[20px] bg-wine p-4.5 text-onwine shadow-[0_8px_22px_rgba(43,16,21,0.14)]">
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-onwine text-[16px] font-bold text-wine">
          {initials(me.username)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[18px] font-semibold">{me.username}</span>
          <span className="mt-0.5 block text-[12px] text-onwine2">
            {me.alias} · {formatBirthdayFull(me.birthday)}
          </span>
        </span>
      </div>

      <ConfigToggles prefs={prefs} theme={theme} />

      <LogoutButton />
    </div>
  );
}
