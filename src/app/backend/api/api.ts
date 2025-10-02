export * from './echo.service';
import { EchoService } from './echo.service';
export * from './profile.service';
import { ProfileService } from './profile.service';
export const APIS = [EchoService, ProfileService];
