export interface SelectOption {
  key: string;
  value: string | number | null;
  disabled?: boolean;
}

export class SelectOptionKey implements SelectOption {
  key: string;
  value: string | number | null;
  disabled?: boolean;
  constructor(keyAndValue: string | number, disabled?: boolean) {
    this.key = keyAndValue + '';
    this.value = keyAndValue;
    this.disabled = disabled;
  }
}

export class SelectOptionKvp implements SelectOption {
  constructor(
    public key: string,
    public value: string | number | null,
    public disabled?: boolean,
  ) {}
}
