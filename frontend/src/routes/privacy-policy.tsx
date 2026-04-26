import { createFileRoute } from '@tanstack/react-router'

import { H2 } from 'libraries/ui'
import { Page } from 'components/Page'

export const Route = createFileRoute('/privacy-policy')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'navigation.privacyPolicy',
  },
})

function RouteComponent() {
  return <Page title="Tietosuojaseloste">
    <div className="max-w-200 lexical-content text-justify">
      <p>Tanssitietokannassa käsitellään tiettyjä henkilötietoja tanssitapahtumien opettajista, esiintyjistä, järjestäjistä ja muusta henkilöstöstä. Tämä tietosuojaseloste kuvaa, miten näitä tietoja käsitellään, mitä oikeuksia rekisteröidyillä on ja miten tietosuoja toteutetaan.</p>
      <H2 id="rekisterinpitäjä">1. Rekisterinpitäjä</H2>
      <p>Purr Consuegra</p>
      <H2 id="rekisterin-nimi">2. Rekisterin nimi</H2>
      <p>Tanssitapahtumien opettaja- ja henkilöstörekisteri.</p>
      <H2 id="henkilötietojen-käsittelyn-tarkoitus">3. Henkilötietojen käsittelyn tarkoitus</H2>
      <p>Rekisterin tarkoituksena on:</p>
      <ul>
        <li>julkaista tanssitapahtumien ohjelmatietoja verkkosivustolla</li>
        <li>ilmoittaa tapahtumissa toimineet opettajat, esiintyjät, järjestäjät ja muu henkilöstö</li>
        <li>ylläpitää tapahtumien historiatietoja ja arkistoa</li>
        <li>mahdollistaa tapahtumien käytännön organisointi</li>
      </ul>
      <H2 id="käsiteltävät-henkilötiedot">4. Käsiteltävät henkilötiedot</H2>
      <p>Rekisterissä käsitellään ainoastaan seuraavia henkilötietoja:</p>
      <ul>
        <li>nimi</li>
        <li>rooli tapahtumassa (esim. opettaja, DJ, järjestäjä, vapaaehtoinen)</li>
      </ul>
      <p>Rekisterissä ei säilytetä yhteystietoja tai muita henkilötietoja.</p>
      <H2 id="henkilötietojen-käsittelyn-oikeusperuste">5. Henkilötietojen käsittelyn oikeusperuste</H2>
      <p>Henkilötietojen käsittely perustuu rekisterinpitäjän oikeutettuun etuun tiedottaa tapahtumista, dokumentoida toimintaa sekä ylläpitää tapahtumien ohjelma- ja historiatietoja.</p>
      <p>Tarvittaessa käsittely voi perustua myös rekisteröidyn antamaan suostumukseen.</p>
      <H2 id="tietolähteet">6. Tietolähteet</H2>
      <p>Tiedot saadaan:</p>
      <ul>
        <li>rekisteröidyltä henkilöltä itseltään</li>
        <li>tapahtuman järjestäjiltä</li>
        <li>julkisesti julkaistuista ohjelmatiedoista</li>
      </ul>
      <H2 id="tietojen-luovutukset">7. Tietojen luovutukset</H2>
      <p>Tietoja voidaan julkaista rekisterinpitäjän verkkosivustolla tapahtumien ohjelma- ja historiatietoina.</p>
      <p>Tietoja ei myydä eikä luovuteta markkinointitarkoituksiin.</p>
      <H2 id="tietojen-säilytysaika">8. Tietojen säilytysaika</H2>
      <p>Tietoja säilytetään niin kauan kuin se on tarpeellista tapahtumatietojen julkaisemiseksi, toiminnan dokumentoimiseksi ja historiatietojen ylläpitämiseksi.</p>
      <p>Tapahtumien ohjelma- ja historiatietoja voidaan säilyttää pitkäaikaisesti arkistointitarkoituksessa.</p>
      <p>Tarpeettomat tiedot poistetaan säännöllisesti.</p>
      <H2 id="rekisteröidyn-oikeudet">9. Rekisteröidyn oikeudet</H2>
      <p>Rekisteröidyllä on soveltuvan tietosuojalainsäädännön mukaisesti oikeus:</p>
      <ul>
        <li>saada pääsy omiin tietoihinsa</li>
        <li>pyytää virheellisen tiedon oikaisua</li>
        <li>pyytää tietojen poistamista tilanteissa, joissa siihen on lain mukainen peruste</li>
        <li>vastustaa tietojen käsittelyä henkilökohtaiseen erityiseen tilanteeseensa liittyvällä perusteella</li>
        <li>tehdä valitus valvontaviranomaiselle</li>
      </ul>
      <H2 id="tietoturva">10. Tietoturva</H2>
      <p>Tietoja käsitellään asianmukaisesti suojatuissa järjestelmissä. Pääsy tietoihin on rajattu niille henkilöille, joilla on työtehtäviensä perusteella siihen tarve.</p>
      <H2 id="yhteydenotot">11. Yhteydenotot</H2>
      <p>Tietosuojaan liittyvät pyynnöt ja kysymykset:</p>
      {/* Basic obfuscation to avoid harvesting by bots */}
      <p>&#x74;&#x61;&#x6e;&#x73;&#x73;&#x69;&#x74;&#x69;&#x65;&#x74;&#x6f;&#x6b;&#x61;&#x6e;&#x74;&#x61;&#x40;&#x73;&#x61;&#x6e;&#x67;&#x65;&#x2e;&#x66;&#x69;</p>
      <H2 id="muutokset-tietosuojaselosteeseen">12. Muutokset tietosuojaselosteeseen</H2>
      <p>Rekisterinpitäjä voi päivittää tätä tietosuojaselostetta tarvittaessa lainsäädännön tai toiminnan muuttuessa.</p>
    </div>
  </Page>
}
