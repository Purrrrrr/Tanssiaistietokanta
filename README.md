# Ropeconin tanssiaistietokanta

Tätä softaa on käytetty vuoden 2016 Ropeconin tanssiaisten biisien tietojan
katalogisointiin, lunttilappujen luomiseen, sekä tanssiaissettilistojen
näyttämiseen valkokankaalla.

Ohjelmalla voi luoda yksinkertaisen sqlite-kannan hakemistollisesta
äänitiedostoja, ja sitten liittää näihin tiedostoihin metatietoja, kuten
alkusoiton pituuden ja kuvauksen.  Näitä tietoja voi sitten käyttää
settilistojen suunnitteluun ja näyttämiseen valkokankaalta.

Ohjelma osaa myös lukea samaisesta hakemistosta m3u-muotoisia soittolistoja, ja
näyttää niiden perusteella arvion siitä miten kauan soittolistan tanssimiseen
menee, listan siitä, millaiset alkusoitot biiseillä on, lunttilapun, joka kertoo
listan biiseistä lyhyen kuvauksen, sekä diashown, jossa biisit näytetään
seteittäin.

## Tarvittavien riippuvuuksien asentaminen

Tarvitset Python ohjelmointikielen kolmosversion kirjastot, joista joudut
asentamaan ainakin mutagen-, bottle- ja sqlite3-moduulit. Fronttia varten
tarvitset uudehkon nodejs-asennuksen.

Frontin tarvittamat riippuvuudet voi asentaa npm:llä `npm install`.

## Sovelluksen käynnistäminen 

Sovelluksen taustapalvelimena toimiva python skripti käynnistetään antamalla
sille parametriksi biisien sisältävän hakemiston polku. Vaihtoehtoisina
lisäparametreina voi antaa haluttujen soittolistojen polut.

Frontin voit laittaa pystyyn komennolla `npm start`. Frontin webpack-palvelin
kuuntelee automaattisesti backendin porttia ja proxyttää sen. Vaihtoehtoisesti
voit luoda frontista version komennolla `npm run build` ja laittaa jonkin
toisen palvelimen tarjoaamaan näitä tiedostoja sopivilla proxy-asetuksilla.

## Käyttö

Sovelluksen tulisi olla melko helppo käyttää. Kaikki muutokset tallentuvat
tietokantaan automaattisesti. Osaa biisien infoteksteistä voi myös klikata ja
muokata suoraan varsinaisen biisitietokantatäbin ulkopuolella.

Kannattaa muistaa, että Esc-näppäin poistuu kaikista koko ruudun tiloista.
Diashow:ssa taas voi liikkua nuolinäppäimillä.

### Soittolistojen luominen

Jos sovellukselle ei anneta parametrina soittolistoja, se hakee automaattisesti
kaikki m3u-muotoiset soittolistat sille annetusta biisihakemistosta. Sekä
soittolistat, että biisien tiedot voi ladata levyltä uudelleen painamalla "Lataa
biisitiedot uusiksi" -nappia tai R-näppäintä näppäimistöllä.

Biisilistat ovat aivan tavallisia m3u-soittolistoja, yksi biisitiedoston nimi
per rivi.  Tällä hetkellä sovellus ei tue biisien tiedostopolkuja, joudut
käyttämään pelkkää tiedostonimeä.  Myöskään soittolistoja ei voi (vielä)
sovelluksen kautta muokata. (Siksi sovelluksessa on se uudelleenlatausnäppäin.)

Lisänä normaaliin m3u-formaattiin ovat setit, joita merkataan #-merkillä
alkavilla soittolistakommenteilla. Näitä voi käyttää niputtamaan soittolistoja
sovelluksessa setteihin ja useimmat sovelluksen toiminnot käyttävätkin tätä
hyväkseen.

## Puuttuvia ominaisuuksia

Selkeämpi muokkaus ja rakenne
Muokkaustoiminnot salasanan takana
Parempi seuraavan biisin näyttäminen
Slideshow:hun mahdollisuus lisätä infoslaideja ja taukomusiikin järkevämpi käsittely
