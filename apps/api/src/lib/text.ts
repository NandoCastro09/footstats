/** Minúsculas e sem acentos, para busca ("sao paulo" encontra "São Paulo"). */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
