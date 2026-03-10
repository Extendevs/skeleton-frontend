import type { SileoOptions, SileoPosition } from 'sileo'
import { sileo } from 'sileo'

const DEFAULTS: Partial<SileoOptions> = {
    fill: 'black', styles: {
        title: 'text-white!',
        description: 'text-white/75!',
        badge: 'bg-white/20!',
        button: 'bg-white/10!',
    },
    duration: 7000,
}

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface PromiseOptions<T = unknown> {
    loading: SileoOptions
    success: SileoOptions | ((_data: T) => SileoOptions)
    error: SileoOptions | ((_err: unknown) => SileoOptions)
    action?: SileoOptions | ((_data: T) => SileoOptions)
    position?: SileoPosition
}

const TOAST_METHODS = {
    success: sileo.success,
    error: sileo.error,
    warning: sileo.warning,
    info: sileo.info,
} as const

function withDefaults(opts: SileoOptions): SileoOptions {
    return { ...DEFAULTS, ...opts }
}

function notify(type: ToastType, opts: SileoOptions): string {
    return TOAST_METHODS[type](withDefaults(opts))
}

function success(titleOrOpts: string | SileoOptions, description?: string): string {
    const opts = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts, description }
        : titleOrOpts
    return sileo.success(withDefaults(opts))
}

function error(titleOrOpts: string | SileoOptions, description?: string): string {
    const opts = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts, description }
        : titleOrOpts
    return sileo.error(withDefaults(opts))
}

function warning(titleOrOpts: string | SileoOptions, description?: string): string {
    const opts = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts, description }
        : titleOrOpts
    return sileo.warning(withDefaults(opts))
}

function info(titleOrOpts: string | SileoOptions, description?: string): string {
    const opts = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts, description }
        : titleOrOpts
    return sileo.info(withDefaults(opts))
}

function action(opts: SileoOptions): string {
    return sileo.action(withDefaults(opts))
}

function promise<T>(p: Promise<T> | (() => Promise<T>), opts: PromiseOptions<T>): Promise<T> {
    return sileo.promise(p, opts)
}

function dismiss(id: string): void {
    sileo.dismiss(id)
}

function clear(position?: SileoPosition): void {
    sileo.clear(position)
}

export const toast = {
    notify,
    success,
    error,
    warning,
    info,
    action,
    promise,
    dismiss,
    clear,
}

export type { PromiseOptions, SileoOptions }
