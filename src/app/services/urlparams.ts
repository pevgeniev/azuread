export function getParams(url: string): Map<string, string>{
    const urlParams = new URLSearchParams(URL.parse(url)?.search);
      const mapUrlParams = new Map<string, string>();
      urlParams.forEach((v, k) => mapUrlParams.set(k.toLocaleLowerCase(), v));
      return mapUrlParams;
}