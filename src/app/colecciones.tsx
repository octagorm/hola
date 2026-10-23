import { CollectionArt } from './art'
import { allLessons, allThemes, tally } from './lib/colecciones'
import { useStore } from './lib/store'

// The way in to the two collections from the home page, under the word
// count and the credential: Los cajones and Tu museo, with how full each is
export function Colecciones() {
  const { bank } = useStore()
  const drawers = tally(bank, allLessons())
  const pictures = tally(bank, allThemes())
  return (
    <div className="q-row2 q-colls">
      <a className="q-frame q-box q-coll" href="#cajones">
        <CollectionArt kind="cajones" open={drawers.done} className="art" />
        <span>
          <h3>
            Los cajones<span>skuffene</span>
          </h3>
          <p>
            En skuff for hvert emne, med en liten ting i som pakkes opp når
            emnet er fullført. {drawers.done} av {drawers.all} er pakket opp.
          </p>
        </span>
      </a>
      <a className="q-frame q-box q-coll" href="#museo">
        <CollectionArt kind="museo" open={pictures.done} className="art" />
        <span>
          <h3>
            Tu museo<span>museet ditt</span>
          </h3>
          <p>
            Et bilde på veggen for hvert emne du fullfører.{' '}
            {pictures.done
              ? `${pictures.done} av ${pictures.all} henger.`
              : `Ingen av de ${pictures.all} henger ennå.`}
          </p>
        </span>
      </a>
    </div>
  )
}
