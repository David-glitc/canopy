"use client";
// @ts-ignore
import Lottie from "lottie-react";
import hero from "../../public/projects/canopy/scene-1/lottie.json";
import vault from "../../public/projects/canopy/scene-2/lottie.json";
import entropy from "../../public/projects/canopy/scene-3/lottie.json";

export function HeroLottie() {
  return <Lottie animationData={hero} loop autoplay style={{ width: 480, height: 320 }} />;
}
export function VaultLottie() {
  return <Lottie animationData={vault} loop autoplay style={{ width: 120, height: 120 }} />;
}
export function EntropyLottie() {
  return <Lottie animationData={entropy} loop autoplay style={{ width: 48, height: 48 }} />;
}
