import { FC } from "react";
import * as React from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { LIGHTBOX_DOUBLE_CLICK_DELAY, LIGHTBOX_DOUBLE_CLICK_MAX_STOPS, LIGHTBOX_DOUBLE_TAP_DELAY, LIGHTBOX_MAX_ZOOM_PIXEL_RATIO, LIGHTBOX_PINCH_ZOOM_DISTANCE_FACTOR, LIGHTBOX_ZOOM_IN_MULTIPLIER } from "@/constant";
/**
 * Props for the ImageLightbox component.
 */
export interface ImageLightboxProps {
    open: boolean;
    onClose: () => void;
    index: number;
    slides: Array<{ src: string }>;
    maxZoomPixelRatio?: number;
    zoomInMultiplier?: number;
}
/**
 * A full-screen image gallery and zoom viewer component.
 * Wraps `yet-another-react-lightbox` with pre-configured plugins and styles.
 * 
 * @param props - Component props following ImageLightboxProps interface.
 */
const ImageLightbox: FC<ImageLightboxProps> = ({ open, onClose, index, slides, maxZoomPixelRatio = LIGHTBOX_MAX_ZOOM_PIXEL_RATIO, zoomInMultiplier = LIGHTBOX_ZOOM_IN_MULTIPLIER }) => {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom, Thumbnails]}
      zoom={{
        maxZoomPixelRatio,
        zoomInMultiplier,
        doubleTapDelay: LIGHTBOX_DOUBLE_TAP_DELAY,
        doubleClickDelay: LIGHTBOX_DOUBLE_CLICK_DELAY,
        doubleClickMaxStops: LIGHTBOX_DOUBLE_CLICK_MAX_STOPS,
        pinchZoomDistanceFactor: LIGHTBOX_PINCH_ZOOM_DISTANCE_FACTOR,
        scrollToZoom: true,
      }}
      controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
      styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.9)", zIndex: 9999 }, slide: { cursor: "zoom-in" }, thumbnail: { backgroundColor: "rgba(0,0,0,0.5)" } }}
    />
  );
};
export default ImageLightbox;
