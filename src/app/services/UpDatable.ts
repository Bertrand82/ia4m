import { BgMail, Email } from "../modeles/BgMail";

export interface Updatable {
  updateView(): void;
}

export interface onChangeEmailSelected {
  onChangeEmailSelected(email: BgMail): void;
}