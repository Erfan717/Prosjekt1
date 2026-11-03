import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Kort, Skjerm, Topptekst } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useFremgang } from '@/hooks/fremgang';
import { dagerPaRad, datoNokkel, denneUken, lengsteRekke } from '@/lib/streak';

const ukedager = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

/** Kort tekst under tallet som forteller hva du bør gjøre i dag. */
function streakTekst(rekke: number, gjortIDag: boolean): string {
  if (gjortIDag) return 'Bra! Dagen er med i rekken.';
  if (rekke > 0) return 'Lær dagens ord for å holde rekken i gang.';
  return 'Lær dagens ord for å starte en ny rekke.';
}

export default function FremgangSkjerm() {
  const { aktiveDager, laerteOrd, ovelserFullfort } = useFremgang();
  const [iDag, setIDag] = useState(() => new Date());

  // Regn ut på nytt når appen kommer tilbake i forgrunnen, i tilfelle det har blitt en ny dag.
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (status) => {
      if (status === 'active') setIDag(new Date());
    });
    return () => abonnement.remove();
  }, []);

  const rekke = dagerPaRad(aktiveDager, iDag);
  const gjortIDag = aktiveDager.includes(datoNokkel(iDag));
  const uke = denneUken(aktiveDager, iDag);
  // Mandag = 0, så vi kan markere dagen i dag i ukeoversikten.
  const idagIndeks = (iDag.getDay() + 6) % 7;

  const statistikk = [
    { etikett: 'Ord lært', verdi: laerteOrd.length, farge: Colors.dark.accent },
    { etikett: 'Øvelser fullført', verdi: ovelserFullfort, farge: Colors.dark.accentCalm },
    { etikett: 'Lengste rekke', verdi: lengsteRekke(aktiveDager), farge: Colors.dark.accentWarm },
  ];

  return (
    <Skjerm>
      <Topptekst
        etikett="Fremgang"
        tittel="Litt hver dag"
        tekst="Lær dagens ord eller fullfør en øvelse, så teller dagen."
      />

      <Kort gradientCss={Gradients.varm}>
        <ThemedText type="eyebrow" style={styles.lysEtikett}>
          Dager på rad
        </ThemedText>
        <ThemedText type="stat" style={styles.stortTall}>
          {rekke}
        </ThemedText>
        <ThemedText type="small" style={styles.dagTekst}>
          {streakTekst(rekke, gjortIDag)}
        </ThemedText>
        <View style={styles.uke}>
          {ukedager.map((dag, i) => (
            <View key={i} style={styles.dag}>
              <View
                style={[styles.dagPrikk, uke[i] && styles.dagPrikkAktiv, i === idagIndeks && styles.dagPrikkIDag]}
              />
              <ThemedText type="small" style={[styles.dagTekst, i === idagIndeks && styles.dagTekstIDag]}>
                {dag}
              </ThemedText>
            </View>
          ))}
        </View>
      </Kort>

      <View style={styles.rutenett}>
        {statistikk.map((s) => (
          <Kort key={s.etikett} style={styles.rute}>
            <ThemedText type="stat" style={{ color: s.farge }}>
              {s.verdi}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {s.etikett}
            </ThemedText>
          </Kort>
        ))}
      </View>

      <ThemedText type="small" themeColor="textMuted" style={styles.fotnote}>
        Små steg hver dag blir til store endringer.
      </ThemedText>
    </Skjerm>
  );
}

const styles = StyleSheet.create({
  lysEtikett: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  stortTall: {
    fontSize: 64,
    lineHeight: 70,
    color: '#FFFFFF',
  },
  uke: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  dag: {
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  dagPrikk: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dagPrikkAktiv: {
    backgroundColor: Colors.dark.accentWarm,
  },
  dagPrikkIDag: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  dagTekst: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dagTekstIDag: {
    color: '#FFFFFF',
    fontWeight: 600,
  },
  rutenett: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rute: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  fotnote: {
    textAlign: 'center',
    marginTop: Spacing.three,
  },
});
