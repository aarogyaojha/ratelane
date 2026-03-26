import { RateRequest, RateQuote } from '@prisma/client';

export const CARRIERS = 'CARRIERS';

/**
 * Interface for carriers that support shipping rate calculation.
 */
export interface IRateProvider {
  getRates(request: RateRequest): Promise<RateQuote[]>;
}

/**
 * Interface for carriers that support shipment tracking.
 */
export interface ITrackingProvider {
  getTracking(trackingId: string): Promise<any>;
}

/**
 * Interface for carriers that support shipping label generation.
 */
export interface ILabelProvider {
  createLabel(request: any): Promise<any>;
}

/**
 * Unified Carrier interface that maps a unique carrier ID to its supported operations.
 * New operations (e.g. tracking, labels) can be added as optional capabilities 
 * without breaking existing rating functionality.
 */
export interface ICarrier {
  readonly carrierId: string;
  readonly capabilities: {
    rates?: IRateProvider;
    tracking?: ITrackingProvider;
    labels?: ILabelProvider;
  };
}
