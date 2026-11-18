import { fireEvent, render, screen } from '@testing-library/react-native';
import { Flame } from 'lucide-react-native';

import { Button, Chip, EmptyState, ExerciseRow, RingTimer, Segmented, StatTile, TextField, WeekStrip } from '@/components/ui';
import { I18nProvider } from '@/i18n';
import { dayKey } from '@/lib/date';

describe('UI components', () => {
  it('Button fires onPress and is labelled for screen readers', async () => {
    const onPress = jest.fn();
    await render(<Button label="Bilow hadda" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Bilow hadda' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled Button does not fire', async () => {
    const onPress = jest.fn();
    await render(<Button label="Xiga" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('button', { name: 'Xiga' }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Xiga' })).toBeDisabled();
  });

  it('Chip exposes selected state', async () => {
    await render(<Chip label="HIIT" selected />);
    expect(screen.getByRole('button', { name: 'HIIT' })).toBeSelected();
  });

  it('StatTile reads value and unit together', async () => {
    await render(<StatTile icon={Flame} value={320} unit="kcal" label="Kalori" />);
    expect(screen.getByLabelText('Kalori: 320 kcal')).toBeTruthy();
  });

  it('ExerciseRow shows zero-padded index and detail', async () => {
    const onPress = jest.fn();
    await render(<ExerciseRow index={3} name="Bench Press" detail="4 × 10 · 60 kg" onPress={onPress} />);
    expect(screen.getByText('03')).toBeTruthy();
    expect(screen.getByText('4 × 10 · 60 kg')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('RingTimer shows the clock and +15 action', async () => {
    const onAdd = jest.fn();
    await render(<RingTimer remaining={75} total={90} caption="NASASHO" addLabel="+15 il." onAdd={onAdd} />);
    expect(screen.getByTestId('ring-timer-value')).toHaveTextContent('01:15');
    await fireEvent.press(screen.getByRole('button', { name: '+15 il.' }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('WeekStrip starts on Saturday in Somali and marks done days', async () => {
    const today = new Date(2026, 10, 25); // Wednesday
    await render(
      <I18nProvider>
        <WeekStrip today={today} doneDays={new Set([dayKey(new Date(2026, 10, 23))])} />
      </I18nProvider>,
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(7);
    expect(tabs[0]).toHaveAccessibleName('Sab 21');
    expect(tabs[6]).toHaveAccessibleName('Jim 27');
    expect(tabs[2]).toHaveAccessibleName('Isn 23, Waa la dhammeeyey'); // Monday done
    expect(tabs[4]).toBeSelected(); // today
  });

  it('Segmented switches value', async () => {
    const onChange = jest.fn();
    await render(
      <Segmented
        options={[
          { value: 'week', label: 'Todobaad' },
          { value: 'month', label: 'Bil' },
        ]}
        value="week"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Todobaad' })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: 'Bil' }));
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('TextField toggles password visibility and shows errors', async () => {
    await render(<TextField label="Furaha sirta" secure showLabel="Muuji furaha" hideLabel="Qari furaha" error="Gaaban" testID="pw" />);
    expect(screen.getByTestId('pw')).toHaveProp('secureTextEntry', true);
    await fireEvent.press(screen.getByRole('button', { name: 'Muuji furaha' }));
    expect(screen.getByTestId('pw')).toHaveProp('secureTextEntry', false);
    expect(screen.getByText('Gaaban')).toBeTruthy();
  });

  it('EmptyState renders title and body', async () => {
    await render(<EmptyState title="Jimicsi lama helin." body="Isku day eray kale" />);
    expect(screen.getByText('Jimicsi lama helin.')).toBeTruthy();
  });
});
