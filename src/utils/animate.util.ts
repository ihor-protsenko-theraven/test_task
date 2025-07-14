import {Container} from "pixi.js";
import {Tween} from "@tweenjs/tween.js";

export function animateMove(
    container: Container,
    x: number,
    y: number,
    duration: number,
    easing: (amount: number) => number,
    onComplete?: () => void
): void {
    const tween = new Tween(container)
        .to({x, y, alpha: 1}, duration)
        .easing(easing);

    if (onComplete) {
        tween.onComplete(onComplete);
    }

    tween.start();
}
