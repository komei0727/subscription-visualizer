import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
    expect(cn('foo', undefined, 'baz')).toBe('foo baz')
    expect(cn('foo', null, 'baz')).toBe('foo baz')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
    expect(cn('foo', ['bar', 'baz'])).toBe('foo bar baz')
  })

  it('handles objects with boolean values', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('bg-red-500 hover:bg-red-600', 'bg-blue-500')).toBe('hover:bg-red-600 bg-blue-500')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn('', '')).toBe('')
  })

  it('handles duplicate classes', () => {
    // clsx doesn't automatically remove duplicates, but that's OK
    // The important thing is that tailwind-merge handles conflicts correctly
    expect(cn('foo bar', 'bar baz')).toContain('foo')
    expect(cn('foo bar', 'bar baz')).toContain('bar')
    expect(cn('foo bar', 'bar baz')).toContain('baz')
    expect(cn('foo foo foo')).toBe('foo')
  })

  it('handles complex combinations', () => {
    const result = cn(
      'base-class',
      {
        'conditional-true': true,
        'conditional-false': false,
      },
      ['array-class-1', 'array-class-2'],
      undefined,
      null,
      false && 'false-condition',
      true && 'true-condition'
    )
    
    expect(result).toBe('base-class conditional-true array-class-1 array-class-2 true-condition')
  })

  it('preserves important tailwind modifiers', () => {
    expect(cn('!text-red-500', 'text-blue-500')).toBe('!text-red-500 text-blue-500')
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500')
    expect(cn('sm:text-lg md:text-xl', 'lg:text-2xl')).toBe('sm:text-lg md:text-xl lg:text-2xl')
  })
})