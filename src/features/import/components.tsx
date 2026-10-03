import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import {
  formatDate,
  importLabel,
  parseImportError,
  toDateOnly,
  toneFor,
  type Tone,
} from '@/features/import/format';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

// Data loading ----------------------------------------------------------------

type LoaderState<T> = {
  data: T | null;
  error: string | null;
  errorCode: string | null;
  loading: boolean;
  refreshing: boolean;
  reload: () => Promise<void>;
  refresh: () => void;
  setData: (data: T) => void;
};

/** Loads on focus so returning from a detail screen always shows server state. */
export function useImportLoader<T>(loader: () => Promise<T>, deps: unknown[]): LoaderState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });
  const seq = useRef(0);

  const reload = useCallback(async () => {
    const id = ++seq.current;
    try {
      const next = await loaderRef.current();
      if (id !== seq.current) return;
      setData(next);
      setError(null);
      setErrorCode(null);
    } catch (err) {
      if (id !== seq.current) return;
      const parsed = parseImportError(err);
      setError(parsed.message);
      setErrorCode(parsed.code);
    } finally {
      if (id === seq.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const depsKey = JSON.stringify(deps);
  const lastKey = useRef(depsKey);
  useFocusEffect(
    useCallback(() => {
      // A filter change shows the loading state; a plain refocus refreshes silently.
      if (lastKey.current !== depsKey) {
        lastKey.current = depsKey;
        setLoading(true);
      }
      void reload();
    }, [reload, depsKey]),
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    void reload();
  }, [reload]);

  return { data, error, errorCode, loading, refreshing, reload, refresh, setData };
}

// Layout ----------------------------------------------------------------------

export function ImportScreen({
  title,
  children,
  refreshing,
  onRefresh,
  footer,
}: {
  title: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <AppHeader variant="back" title={title} onBack={() => router.back()} />
      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: (footer ? 16 : insets.bottom) + 24, gap: 12 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <View className="h-sm" />
        {children}
      </ScrollView>
      {footer ? (
        <View
          className="border-t border-brand-border bg-brand-white px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          {footer}
        </View>
      ) : null}
    </ScreenWrapper>
  );
}

export function Card({
  title,
  right,
  children,
  className,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}>
      {title ? (
        <View className="mb-md flex-row items-center justify-between gap-sm">
          <Typography variant="fieldLabel" className="flex-1 text-brand-muted">
            {title}
          </Typography>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Collapsible group for optional fields; opens itself when it holds values or errors. */
export function MoreDetails({
  title = 'More details (optional)',
  hasValues,
  hasErrors,
  children,
}: {
  title?: string;
  hasValues: boolean;
  hasErrors: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(hasValues || hasErrors);
  // Fields with errors must stay reachable, so errors keep the group expanded.
  const expanded = open || hasErrors;
  return (
    <View className="gap-lg">
      <Pressable
        onPress={() => setOpen(!expanded)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="flex-row items-center justify-between rounded-xl border border-brand-border bg-brand-surface px-md py-sm active:opacity-80"
      >
        <Typography
          variant="roleTitle"
          className={cn('text-[14px]', hasErrors && 'text-brand-error')}
        >
          {title}
        </Typography>
        <Typography variant="input" className="text-brand-muted">
          {expanded ? '▴' : '▾'}
        </Typography>
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}

export function KeyValues({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <View className="gap-sm">
      {rows.map(([label, value]) => (
        <View key={label} className="flex-row justify-between gap-md">
          <Typography variant="roleDescription" className="text-brand-muted">
            {label}
          </Typography>
          <Typography variant="roleDescription" className="flex-1 text-right text-brand-heading">
            {value === null || value === undefined || value === '' ? '—' : value}
          </Typography>
        </View>
      ))}
    </View>
  );
}

const TONE_BOX: Record<Tone, string> = {
  neutral: 'bg-[#F1F5F9]',
  info: 'bg-[#E0F2FE]',
  success: 'bg-brand-success-light',
  warning: 'bg-[#FEF3C7]',
  danger: 'bg-brand-error-light',
};

const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-[#334155]',
  info: 'text-[#0369A1]',
  success: 'text-brand-success',
  warning: 'text-[#92400E]',
  danger: 'text-[#B91C1C]',
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const tone = toneFor(status);
  return (
    <View className={cn('self-start rounded-full px-sm py-xs', TONE_BOX[tone])}>
      <Typography variant="badge" className={TONE_TEXT[tone]}>
        {label ?? importLabel(status)}
      </Typography>
    </View>
  );
}

export function Notice({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <View className={cn('rounded-xl px-md py-sm', TONE_BOX[tone])}>
      <Typography variant="roleDescription" className={cn('leading-5', TONE_TEXT[tone])}>
        {children}
      </Typography>
    </View>
  );
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <View className="items-center gap-sm py-2xl">
      <ActivityIndicator color={brandColors.primary} />
      <Typography variant="roleDescription" className="text-brand-muted">
        {label}
      </Typography>
    </View>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="gap-md rounded-2xl border border-brand-error bg-brand-white p-lg">
      <Typography variant="error" className="text-[13px]">
        {message}
      </Typography>
      {onRetry ? <SecondaryButton variant="outline" label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyBlock({ title, message }: { title: string; message?: string }) {
  return (
    <View className="items-center gap-xs rounded-2xl border border-dashed border-brand-border bg-brand-white px-lg py-2xl">
      <Typography variant="roleTitle" className="text-center text-[15px]">
        {title}
      </Typography>
      {message ? (
        <Typography variant="roleDescription" className="text-center text-brand-muted">
          {message}
        </Typography>
      ) : null}
    </View>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={cn(
              'rounded-full border px-md py-xs',
              active
                ? 'border-brand-primary bg-brand-primary-light'
                : 'border-brand-border bg-brand-white',
            )}
          >
            <Typography
              variant="roleDescription"
              className={active ? 'font-semibold text-brand-primary-dark' : 'text-brand-body'}
            >
              {o.label}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Pager({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <View className="flex-row items-center justify-between">
      <SecondaryButton
        variant="outline"
        label="Previous"
        className="w-[110px]"
        disabled={page <= 1}
        onPress={() => onPage(page - 1)}
      />
      <Typography variant="roleDescription" className="text-brand-muted">
        Page {page} of {totalPages} · {total}
      </Typography>
      <SecondaryButton
        variant="outline"
        label="Next"
        className="w-[110px]"
        disabled={page >= totalPages}
        onPress={() => onPage(page + 1)}
      />
    </View>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={brandColors.footer}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="search"
      className="min-h-[44px] rounded-xl border border-brand-border bg-brand-white px-md font-sans text-[15px] text-brand-heading"
    />
  );
}

export function useDebounced<T>(value: T, ms = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

// Form fields -------------------------------------------------------------------

export type Option = { value: string; label: string; hint?: string };

function FieldShell({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View className="w-full">
      <Typography variant="fieldLabel" className="mb-sm">
        {label}
        {required ? ' *' : ''}
      </Typography>
      {children}
      {error ? (
        <Typography variant="error" className="mt-xs">
          {error}
        </Typography>
      ) : hint ? (
        <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-muted">
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}

function Trigger({
  text,
  placeholder,
  error,
  disabled,
  onPress,
  label,
}: {
  text?: string | null;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={cn(
        'min-h-[48px] w-full flex-row items-center justify-between rounded-md border bg-brand-white px-md',
        text ? 'border-brand-primary' : 'border-brand-border',
        error && 'border-brand-error',
        disabled && 'opacity-50',
      )}
    >
      <Typography
        variant="input"
        className={cn('flex-1', !text && 'text-brand-footer')}
        numberOfLines={1}
      >
        {text || placeholder}
      </Typography>
      <Typography variant="input" className="text-brand-muted">
        ▾
      </Typography>
    </Pressable>
  );
}

function OptionSheet({
  title,
  visible,
  onClose,
  options,
  loading,
  value,
  onSelect,
  search,
  onSearch,
  allowClear,
  emptyText,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  options: Option[];
  loading?: boolean;
  value: string | null;
  onSelect: (option: Option | null) => void;
  search?: string;
  onSearch?: (value: string) => void;
  allowClear?: boolean;
  emptyText?: string;
}) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={`Close ${title}`}
      >
        <Pressable
          className="max-h-[75%] w-full rounded-t-[28px] bg-brand-white px-xl pb-2xl pt-lg"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-md h-1.5 w-12 self-center rounded-full bg-brand-border" />
          <Typography variant="headingLeft" className="mb-md text-[20px]">
            {title}
          </Typography>
          {onSearch ? (
            <View className="mb-md">
              <SearchBox value={search ?? ''} onChange={onSearch} placeholder="Search" />
            </View>
          ) : null}
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {allowClear && value ? (
              <Pressable
                onPress={() => onSelect(null)}
                className="mb-sm rounded-2xl border border-dashed border-brand-border px-md py-md"
              >
                <Typography variant="body" className="text-brand-muted">
                  Clear selection
                </Typography>
              </Pressable>
            ) : null}
            {loading ? (
              <ActivityIndicator color={brandColors.primary} className="my-lg" />
            ) : options.length === 0 ? (
              <Typography variant="body" className="px-md py-md text-brand-muted">
                {emptyText ?? 'No options found'}
              </Typography>
            ) : (
              options.map((o) => {
                const selected = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => onSelect(o)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={cn(
                      'mb-sm flex-row items-center justify-between gap-sm rounded-2xl border px-md py-md',
                      selected
                        ? 'border-brand-primary bg-brand-primary-light'
                        : 'border-brand-border bg-brand-surface',
                    )}
                  >
                    <Typography
                      variant="body"
                      className={cn(
                        'flex-1',
                        selected ? 'font-semibold text-brand-primary' : 'text-brand-heading',
                      )}
                    >
                      {o.label}
                    </Typography>
                    {o.hint ? (
                      <Typography variant="roleDescription" className="text-brand-muted">
                        {o.hint}
                      </Typography>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type SelectFieldProps = {
  label: string;
  value: string | null | undefined;
  options: Option[];
  onChange: (value: string | null, option: Option | null) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  allowClear?: boolean;
};

/** Static option list; searchable when the list is long. */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  required,
  error,
  hint,
  disabled,
  allowClear = !required,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find((o) => o.value === value);
  const q = search.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q))
    : options;
  return (
    <FieldShell label={label} required={required} error={error} hint={hint}>
      <Trigger
        label={label}
        text={selected?.label}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        onPress={() => setOpen(true)}
      />
      <OptionSheet
        title={label}
        visible={open}
        onClose={() => setOpen(false)}
        options={filtered}
        value={value ?? null}
        allowClear={allowClear}
        search={search}
        onSearch={options.length > 8 ? setSearch : undefined}
        onSelect={(o) => {
          onChange(o?.value ?? null, o);
          setOpen(false);
          setSearch('');
        }}
      />
    </FieldShell>
  );
}

/** Enum values rendered with their human label. */
export function EnumField({
  values,
  ...props
}: Omit<SelectFieldProps, 'options'> & { values: readonly string[] }) {
  return (
    <SelectField {...props} options={values.map((v) => ({ value: v, label: importLabel(v) }))} />
  );
}

/** Server-searched options (products, grades, brands, ports). */
export function AsyncSelectField({
  label,
  value,
  selectedLabel,
  load,
  onChange,
  placeholder = 'Search',
  required,
  error,
  hint,
  disabled,
}: {
  label: string;
  value: string | null | undefined;
  selectedLabel?: string | null;
  load: (search: string) => Promise<Option[]>;
  onChange: (value: string | null, option: Option | null) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState<{
    key: string;
    options: Option[];
    error: string | null;
  } | null>(null);
  const debounced = useDebounced(search);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  // Each open is a new session, so options always reflect the latest filters (e.g. grade by product).
  const requestKey = `${session}|${debounced.trim()}`;
  const loading = open && result?.key !== requestKey;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadRef
      .current(debounced.trim())
      .then((options) => {
        if (!cancelled) setResult({ key: requestKey, options, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({ key: requestKey, options: [], error: parseImportError(err).message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, debounced, requestKey]);

  return (
    <FieldShell label={label} required={required} error={error} hint={hint}>
      <Trigger
        label={label}
        text={value ? selectedLabel || 'Selected' : null}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        onPress={() => {
          setSession((s) => s + 1);
          setOpen(true);
        }}
      />
      <OptionSheet
        title={label}
        visible={open}
        onClose={() => setOpen(false)}
        options={loading ? [] : (result?.options ?? [])}
        loading={loading}
        value={value ?? null}
        allowClear={!required}
        search={search}
        onSearch={setSearch}
        emptyText={result?.error ?? 'No matches. Try a different search.'}
        onSelect={(o) => {
          onChange(o?.value ?? null, o);
          setOpen(false);
          setSearch('');
        }}
      />
    </FieldShell>
  );
}

const parseDateOnly = (value: string): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

/** Calendar date stored as YYYY-MM-DD. */
export function DateField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  required,
  error,
  hint,
  disabled,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  minimumDate?: string | null;
  maximumDate?: string | null;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const min = minimumDate ? parseDateOnly(minimumDate) : undefined;
  const max = maximumDate ? parseDateOnly(maximumDate) : undefined;
  const current = value ? parseDateOnly(value) : (min ?? new Date());
  const [temp, setTemp] = useState(current);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type === 'set' && date) onChange(toDateOnly(date));
      return;
    }
    if (date) setTemp(date);
  };

  return (
    <FieldShell label={label} required={required} error={error} hint={hint}>
      <View className="flex-row items-center gap-sm">
        <View className="flex-1">
          <Trigger
            label={label}
            text={value ? formatDate(value) : null}
            placeholder="Select date"
            error={error}
            disabled={disabled}
            onPress={() => {
              setTemp(current);
              setOpen(true);
            }}
          />
        </View>
        {value && !required && !disabled ? (
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={8}
            accessibilityLabel={`Clear ${label}`}
          >
            <Typography variant="link">Clear</Typography>
          </Pressable>
        ) : null}
      </View>
      {Platform.OS === 'ios' && open ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
            onPress={() => setOpen(false)}
          >
            <Pressable
              className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg"
              onPress={(event) => event.stopPropagation()}
            >
              <View className="mb-md flex-row items-center justify-between">
                <Typography variant="headingLeft" className="text-[18px]">
                  {label}
                </Typography>
                <Pressable
                  onPress={() => {
                    onChange(toDateOnly(temp));
                    setOpen(false);
                  }}
                  hitSlop={8}
                >
                  <Typography variant="link" className="font-bold">
                    Done
                  </Typography>
                </Pressable>
              </View>
              <DateTimePicker
                value={temp}
                mode="date"
                display="spinner"
                minimumDate={min}
                maximumDate={max}
                onChange={handleChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
      {Platform.OS !== 'ios' && open ? (
        <DateTimePicker
          value={current}
          mode="date"
          display="default"
          minimumDate={min}
          maximumDate={max}
          onChange={handleChange}
        />
      ) : null}
    </FieldShell>
  );
}

export function CheckRow({
  checked,
  onToggle,
  title,
  description,
  disabled,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  description?: string | null;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      className={cn(
        'flex-row items-start gap-md rounded-xl border px-md py-sm',
        checked
          ? 'border-brand-primary bg-brand-primary-tint'
          : 'border-brand-border bg-brand-white',
        disabled && 'opacity-50',
      )}
    >
      <View
        className={cn(
          'mt-[2px] h-5 w-5 items-center justify-center rounded border',
          checked ? 'border-brand-primary bg-brand-primary' : 'border-brand-border bg-brand-white',
        )}
      >
        {checked ? (
          <Typography variant="badge" className="text-brand-white">
            ✓
          </Typography>
        ) : null}
      </View>
      <View className="flex-1">
        <Typography variant="roleDescription" className="font-medium text-brand-heading">
          {title}
        </Typography>
        {description ? (
          <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
            {description}
          </Typography>
        ) : null}
      </View>
    </Pressable>
  );
}
