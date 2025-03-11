// Type definitions for Leaflet.PolylineDecorator
declare namespace L {
    interface PolylineDecoratorOptions {
      patterns: Array<{
        offset?: string | number
        endOffset?: string | number
        repeat: string | number
        symbol: any
      }>
    }

    interface PolylineDecoratorStatic {
      new (polyline: L.Polyline, options: PolylineDecoratorOptions): L.PolylineDecorator
    }

    interface PolylineDecorator extends L.Layer {}

    interface SymbolStatic {
      marker(options: any): any
      arrowHead(options: any): any
      dash(options: any): any
    }

    const Symbol: SymbolStatic
    const polylineDecorator: PolylineDecoratorStatic
  }

  declare module "leaflet-polylinedecorator" {
    export = L
  }

