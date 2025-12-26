import { Type } from '@angular/core';
import { ModalShellBase } from './modal-shell.base';
import { ModalShellHeader } from './modal-shell.header';

/**
 * This solution allows for a working enum based strategy pattern.
 * Example usage:
 *
 * // Valid example
 * await this.modal.open(
 *       SomeModal,
 *       {
 *         ...payload
 *       },
 *       {
 *         shellType: ShellType.HEADER,
 *         title: 'Test',
 *       },
 * );
 *
 * // Will not compile
 * await this.modal.open(
 *       SomeModal,
 *       {
 *         ...payload
 *       },
 *       {
 *         shellType: ShellType.HEADER, // missing required title field
 *       },
 * );
 *
 * // Will not compile
 * await this.modal.open(
 *       SomeModal,
 *       {
 *         ...payload
 *       },
 *       {
 *         shellType: ShellType.BLANK,
 *         title: 'Test', // Non-required field for BLANK shell type.
 *       },
 * );
 */

export enum ShellType {
  BLANK = 'BLANK',
  HEADER = 'HEADER',
}

export interface ShellConfigBlank {
  shellType: ShellType.BLANK;
}

export interface ShellConfigHeader {
  shellType: ShellType.HEADER;
  title: string;
  showCloseButton?: boolean; // Optional specific prop
}

// The Discriminated Union
// TS will look at 'type' and know which interface to enforce.
export type ShellConfig = ShellConfigBlank | ShellConfigHeader;

// Component Mapping Registry.
export const SHELL_COMPONENT_MAP: Record<ShellType, Type<ModalShellBase>> = {
  [ShellType.BLANK]: ModalShellBase,
  [ShellType.HEADER]: ModalShellHeader,
};
