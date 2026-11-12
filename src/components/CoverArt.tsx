import { useState } from "react";
import logoAsset from "@/assets/logo-radio-sinta.webp";

export function CoverArt({
  src,
  className = "",
  eager = false,
}: {
  src: string | null;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <div className={`cover-art ${className}`}>
      {src && failed !== src ? (
        <img
          src={src}
          width={500}
          height={500}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(src)}
        />
      ) : (
        <div className="cover-fallback">
          <img src={logoAsset} width={500} height={500} alt="Rádio Sinta" decoding="async" />
        </div>
      )}
    </div>
  );
}
