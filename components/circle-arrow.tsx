import Image from "next/image";

export function CircleArrow({
  reverse = false,
  tone = "dark",
}: {
  reverse?: boolean;
  tone?: "dark" | "light" | "responsive";
}) {
  const borderColor =
    tone === "light"
      ? "border-white"
      : tone === "responsive"
        ? "border-portfolio-deep lg:border-white"
        : "border-portfolio-deep";
  const iconColor =
    tone === "light" ? "" : tone === "responsive" ? "brightness-0 lg:brightness-100" : "brightness-0";

  return (
    <span
      className={`grid size-12 shrink-0 place-items-center rounded-full border transition-transform duration-300 group-hover:scale-110 ${borderColor}`}
    >
      <Image
        src="/arrow-right.svg"
        alt=""
        width={29}
        height={20}
        className={`h-auto w-7 transition-transform duration-300 group-hover:translate-x-0.5 ${iconColor} ${reverse ? "rotate-180 group-hover:-translate-x-0.5" : ""}`}
      />
    </span>
  );
}
