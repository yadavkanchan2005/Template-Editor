import "fabric";

declare module "fabric" {
  interface Canvas {
    bringForward(object: FabricObject, intersecting?: boolean): void;
    sendBackwards(object: FabricObject, intersecting?: boolean): void;
    bringToFront(object: FabricObject): void;
    sendToBack(object: FabricObject): void;
  }
}
