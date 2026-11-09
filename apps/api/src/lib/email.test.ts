import { describe, expect, it } from "vitest";
import { isValidEmail, suggestEmail } from "./email.js";

describe("suggestEmail", () => {
  it.each([
    ["teste@gmial.com", "teste@gmail.com"],
    ["teste@gmai.com", "teste@gmail.com"],
    ["teste@gmaill.com", "teste@gmail.com"],
    ["teste@gmail.com.br", null],
    ["teste@hotmial.com.br", "teste@hotmail.com.br"],
    ["teste@outlok.com", "teste@outlook.com"],
    ["teste@yahooo.com", "teste@yahoo.com"],
    ["teste@iclod.com", "teste@icloud.com"],
  ])("%s → %s", (input, expected) => {
    expect(suggestEmail(input)).toBe(expected);
  });

  it.each(["a@gmail.com", "a@mail.com", "a@email.com", "a@ymail.com", "a@empresa.com.br", "a@uol.com.br"])(
    "não sugere nada para %s",
    (input) => expect(suggestEmail(input)).toBeNull()
  );
});

describe("isValidEmail", () => {
  it.each(["teste@gmail.comsadsad", "teste@gmail.co", "a..b@x.com", "teste@.com"])("recusa %s", (input) =>
    expect(isValidEmail(input)).toBe(false)
  );
  it.each(["ana@hotmail.com.br", "x@yahoo.co.uk", "x@empresa.com.br"])("aceita %s", (input) =>
    expect(isValidEmail(input)).toBe(true)
  );
});
