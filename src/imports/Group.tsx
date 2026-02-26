import svgPaths from "./svg-pwclppfmas";

export default function Group() {
  return (
    <div className="relative size-full" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g clipPath="url(#clip0_4_140)" id="Group">
          <path d={svgPaths.p3e7b1600} fill="var(--fill-0, #CEF62E)" id="Vector" />
          <path d={svgPaths.p1dc30500} fill="var(--fill-0, #0A080B)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_4_140">
            <rect fill="white" height="40" width="40" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}