import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { Configuration, ConfigurationParameters } from "../backend";

export function withBackendApiConfiguration(configurationParameters: ConfigurationParameters = {}): Configuration {
    return new Configuration({
        // any default parameters
        basePath: 'https://localhost:44370/',
        // overrides
        ...configurationParameters,
    });
}

export function provideApi(withConfiguration:  Configuration = withBackendApiConfiguration()): EnvironmentProviders {
    return makeEnvironmentProviders([
        {provide: Configuration, useValue: withConfiguration},
    ]);
}