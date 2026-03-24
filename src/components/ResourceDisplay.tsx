import { useState } from "react";
import { useGameStore, BUILDINGS_DATA, UPGRADES_DATA, HEROES_DATA, VILLAINS_LIST, PRESTIGE_THRESHOLD } from "../store/useGameStore";

const ASSETS = {
  factions: {
    shield: "https://upload.wikimedia.org/wikipedia/fr/2/24/Logo_du_Strategic_Homeland_Intervention_Enforcement_Logistics_Division.svg",
    kamar: "https://static.wikia.nocookie.net/marvelstudios/images/0/08/Attack_on_Kamar-Taj.png/revision/latest?cb=20230523111209&path-prefix=fr",
    stark: "https://static.wikia.nocookie.net/marvelmovies/images/f/f0/Stark_Industries_SNWH.png/revision/latest?cb=20220503211317",
    asgard: "https://www.marvel-cineverse.fr/medias/images/siegedasgard-imgprofil.jpg",
    wakanda: "https://static.wikia.nocookie.net/marvelstudios/images/9/9f/Black-panther-dora-milaje.jpg/revision/latest?cb=20210627100413&path-prefix=fr",
    xmansion: "https://static.wikia.nocookie.net/xmenmovies/images/d/d3/Xavier-s-school-for-gifted-children-aka-the-x-mansion-in-the-x-men-films.png/revision/latest?cb=20241013181532",
    baxter: "https://preview.redd.it/concept-art-of-the-baxter-building-v0-urkeyzzq8s9f1.jpeg?auto=webp&s=90c2615a6ae059bb7e948237461344ab4ca195f7",
    knowhere: "https://static.wikia.nocookie.net/marvelstudios/images/d/d9/Knowhere_-_movie.png/revision/latest?cb=20160625112642&path-prefix=fr",
    sakaar: "https://www.marvel-world.com/contents/encyclopedie/lieux/s/sakaar/sakaar_13.jpg",
    nidavellir: "https://static.wikia.nocookie.net/marvelstudios/images/a/aa/Eitri1.webp/revision/latest?cb=20220331091005&path-prefix=fr",
    pym: "https://static.wikia.nocookie.net/marvelstudios/images/8/8b/Ant-Man_Pym_Technologies_building.jpg/revision/latest/scale-to-width-down/1200?cb=20151125162051&path-prefix=fr",
    avengers: "https://static.wikia.nocookie.net/marvelstudios/images/7/7e/Avengers_Tower_AoU_cropped.webp/revision/latest?cb=20210405134718&path-prefix=fr",
    xandar: "https://static.wikia.nocookie.net/marveldatabase/images/4/4c/Nova_Corps_%28Earth-616%29_from_Champions_Vol_3_8_001.jpg/revision/latest?cb=20200811034209",
    ravagers: "https://static.wikia.nocookie.net/marvelstudios/images/6/6d/TheRavagers.jpg/revision/latest?cb=20180907202121&path-prefix=fr",
    tva: "https://preview.redd.it/did-anyone-else-actually-feel-bad-for-the-tva-agents-in-the-v0-xjt95s0mmmtd1.jpeg?auto=webp&s=da9e26f97dba08758b118c9203c3192bf009526d",
    talo: "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/0/0f/Ta_Lo_Armed_Forces.png/revision/latest?cb=20211207022347",
    sorcieres: "https://www.superpouvoir.com/wp-content/uploads/2024/09/salem-seven-faq1-1200x600.jpg",
    kang: "https://www.marvel-world.com/contents/encyclopedie/biographies/k/kang-le-conquerant/kang-le-conquerant_10.jpg",
    wundagore: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG8FGIZ39RtuUA-x5rYfPUQnYIsbCJxiRhrQ&s",
    le_vide: "https://www.premiere.fr/sites/default/files/styles/scale_crop_1280x720/public/2025-09/Marvel%20Zombies_0.jpg"
  } as Record<string, string>,
  heroes: {
    hawkeye: "https://static.wikia.nocookie.net/marvelstudios/images/2/27/Clint_Barton-Endgame-Profil.jpg/revision/latest?cb=20190610084832&path-prefix=fr",
    daredevil: "https://static.tvtropes.org/pmwiki/pub/images/a2b300a4_14fc_470e_9a06_5acd5059b429.jpeg",
    falcon: "https://i.redd.it/f878j337uqk21.jpg",
    cap: "https://image.jeuxvideo.com/medias-md/168216/1682158014-8260-card.jpg",
    ws: "https://static.wikia.nocookie.net/villains-fr/images/f/f0/Bucky_barnes.jpg/revision/latest?cb=20210211204534&path-prefix=fr",
    bw: "https://static.wikia.nocookie.net/marvelstudios/images/c/ca/3198DFA3-B895-4149-AF94-F4EC7E4D9BFF.jpeg/revision/latest?cb=20210323194108&path-prefix=fr",
    antman: "https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/b72de7d5_4856_4e00_8a57_ab8f227e7e26.jpeg",
    wolverine: "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/5/57/The_Wolverine.jpg/revision/latest?cb=20240621175727",
    im: "https://images.immediate.co.uk/production/volatile/sites/3/2018/05/IRON-2008-d7a2706.jpg?quality=90&resize=800,534",
    spidey: "https://upload.wikimedia.org/wikipedia/en/0/0f/Tom_Holland_as_Spider-Man.jpg",
    bp: "https://upload.wikimedia.org/wikipedia/en/1/1a/Chadwick_Boseman_as_T%27Challa.jpg",
    shangchi: "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/4/40/Shang-Chi_Profile.jpg/revision/latest?cb=20250318203001",
    hulk: "https://i.redd.it/xn3o532apjrb1.jpg",
    vision: "https://upload.wikimedia.org/wikipedia/en/f/fc/Paul_Bettany_as_Vision.jpg",
    thor: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Chris_Hemsworth_as_Thor.jpg/250px-Chris_Hemsworth_as_Thor.jpg",
    strange: "https://static.wikia.nocookie.net/ultimate-marvel-cinematic-universe/images/6/61/Doc.jpg/revision/latest?cb=20160117222945",
    wanda: "https://static.wikia.nocookie.net/heroes-and-villain/images/3/36/Profile_-_Scarlet_Witch.png/revision/latest?cb=20241117013207",
    starlord: "https://static.wikia.nocookie.net/marvelstudios/images/4/40/Star-lord-poster-infinity.jpg/revision/latest?cb=20180404234211&path-prefix=fr",
    groot: "https://static.wikia.nocookie.net/heros/images/2/22/Groot_MCU_Infobox.jpg/revision/latest?cb=20200719195311&path-prefix=fr",
    rocket: "https://i.redd.it/rocket-raccoon-is-the-smartest-character-in-the-mcu-thoughts-v0-92h0exh7fogb1.jpg?width=980&format=pjpg&auto=webp&s=968ad9ea24017b55ce4ab57511b0a35533aabdc3",
    captainmarvel: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyQtwumMK4z-sDXl3nBUI87NuZPETl7ZGY5Q&s",
    silver: "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/6/65/Shalla-Bal_%28Silver_Surfer%29_Infobox.png/revision/latest?cb=20250716023128",
    namor: "https://preview.redd.it/is-mcu-namor-good-v0-swkhj5yclujd1.jpeg?auto=webp&s=65c65a260318159ca0bcfa901a6f87bcccf3b3fe",
    ghostrider: "https://preview.redd.it/who-is-currently-the-ghost-rider-in-the-mcu-who-would-you-v0-teop6rya2cfe1.jpeg?auto=webp&s=f048f3a603fb1aac9855b397172b4cce82e43861",
    blade: "https://www.premiere.fr/sites/default/files/styles/scale_crop_border_white_1280x720/public/2024-08/FotoJet%20-%202024-08-13T110234.963.jpg",
    deadpool: "https://www.numerama.com/wp-content/uploads/2022/03/deadpool-oops.jpg",
    cable: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtgxbjEUzEeD_joQzUQiSdjeodsPKVJ87k3LIKpkh8DQ&s&ec=121585071",
    jeangrey: "https://static.wikia.nocookie.net/heroes-and-villain/images/a/a7/Jean_GreyXMen_Movies.png/revision/latest?cb=20220430145716",
    cyclops: "https://static.wikia.nocookie.net/xmenfirstclass/images/3/3f/Xmen-apocalypse-poster-personnage-cyclope.jpg/revision/latest?cb=20160408131912&path-prefix=fr",
    storm: "https://upload.wikimedia.org/wikipedia/en/3/34/Storm_%28Ororo_Munroe%29.png"
  } as Record<string, string>,
  villains: {
    "Batroc": "https://www.fulguropop.com/wp-content/uploads/2020/01/batroc-mcu.jpg",
    "Crossbones": "https://www.marvel-cineverse.fr/medias/images/crossbones-profile-cacw.jpg",
    "Zemo": "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/d/d5/TF%26TWS_Textless_Character_Posters_02.jpg/revision/latest?cb=20231021161327",
    "Vautour": "https://static.wikia.nocookie.net/marvelstudios/images/3/37/Vautour.png/revision/latest?cb=20171125120804&path-prefix=fr",
    "Mysterio": "https://pyxis.nymag.com/v1/imgs/d6c/f43/4d468e94dc1b52619ab1886258eb3d9fc1-02-mysterio.rsquare.w400.jpg",
    "Taskmaster": "https://www.marvel-cineverse.fr/medias/images/taskmaster-tdbs-imgprofil.jpg",
    "Kingpin": "https://upload.wikimedia.org/wikipedia/en/c/cf/Vincent_D%27Onofrio_as_Wilson_Fisk_in_Daredevil_%28TV_series%29.jpg",
    "Kraven": "https://static.wixstatic.com/media/e18c18_77914060fc444579a9b5812383d4101f~mv2.jpg/v1/fill/w_568,h_320,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/e18c18_77914060fc444579a9b5812383d4101f~mv2.jpg",
    "Lézard": "https://static.wikia.nocookie.net/marvelstudios/images/a/a6/Lizard_%28SM_NWH%29_official_site.webp/revision/latest?cb=20221111153913&path-prefix=fr",
    "Homme-Sable": "https://static.wikia.nocookie.net/marvelstudios/images/2/20/Sandman044.JPG.webp/revision/latest?cb=20221111155411&path-prefix=fr",
    "Electro": "https://www.marvel-cineverse.fr/medias/images/electroimgprofil.jpg",
    "Rhino": "https://i.redd.it/t6wz9elqcgf51.jpg",
    "Red Skull": "https://static.wikia.nocookie.net/marvelstudios/images/1/18/Captain-America-The-First-Avenger_519e83c9.jpg/revision/latest?cb=20151215152031&path-prefix=fr",
    "Killmonger": "https://cdn.marvel.com/content/2x/108kmg_ons_cut_mob_01_0.jpg",
    "Loki": "https://static.wikia.nocookie.net/marvelstudios/images/4/47/IM_3896.jpeg/revision/latest?cb=20231114174632&path-prefix=fr",
    "Green Goblin": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNRypuvN3EEdPzEeZItiL3HpG0qHG-IxRkFt7Jhwc6mw&s&ec=121585071",
    "Doc Ock": "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/f/fc/DOC_OCK.png/revision/latest?cb=20231122140523",
    "Abomination": "https://www.marvel-cineverse.fr/medias/images/abomination-sha-imgprofil.jpg",
    "Le Leader": "https://www.marvel-cineverse.fr/medias/images/leader-cabnw-imgprofil.jpg",
    "Whiplash": "https://i.redd.it/4wiiqt22ous11.jpg",
    "Le Mandarin": "https://sm.ign.com/t/ign_fr/news/k/kevin-feig/kevin-feige-confirms-the-return-of-the-mandarin-in-the-mcu_rxep.1280.jpg",
    "Venom": "https://www.begeek.fr/app/uploads/2025/08/Venom-660x422.jpeg",
    "Carnage": "https://i.redd.it/8k21o7qjke7b1.jpg",
    "Ronan l'Accusateur": "https://wiki.marvel-world.com/images/thumb/c/cc/Ronan_Terre-199999-Portrait.jpg/300px-Ronan_Terre-199999-Portrait.jpg",
    "Malekith": "https://static.wikia.nocookie.net/marvelstudios/images/1/10/Malekith-TextlessPoster1.webp/revision/latest?cb=20210621170435&path-prefix=fr",
    "Kurse": "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/6/6b/Algrim_Kursed.png/revision/latest?cb=20140914185653",
    "Hela": "https://i.redd.it/xddomca1wiff1.jpeg",
    "Surtur": "https://fbi.cults3d.com/uploaders/16795539/illustration-file/3522863a-e4a5-4d1e-886d-425493a81049/surtur-6.png",
    "Ultron": "https://static.wikia.nocookie.net/marvelstudios/images/a/a2/Infobox-1_Ultron.jpg/revision/latest?cb=20171206213312&path-prefix=fr",
    "Sentinelles": "https://preview.redd.it/i-feel-like-when-they-introduce-the-sentinels-in-the-mcu-v0-z524jc3typid1.jpeg?auto=webp&s=8e89a3ea182264fef8927f66d635f3864e49bdd0",
    "Bastion": "https://upload.wikimedia.org/wikipedia/en/1/14/Bastion.PNG",
    "Magneto": "https://static.wikia.nocookie.net/villains-fr/images/5/5c/Crop.jpg/revision/latest?cb=20201102203030&path-prefix=fr",
    "Mystique": "https://i.pinimg.com/564x/f1/cb/67/f1cb678fdb60ebafb0c8c9491e820995.jpg",
    "Dents-de-Sabre": "https://playcontestofchampions.com/wp-content/uploads/2023/04/champion-sabretooth.webp",
    "Le Fléau": "https://static.wikia.nocookie.net/xmenfirstclass/images/e/ec/Le_Fl%C3%A9au_dans_Deadpool_2.jpg/revision/latest?cb=20180527175221&path-prefix=fr",
    "Mr. Sinistre": "https://preview.redd.it/when-do-you-think-theyll-introduce-mister-sinister-into-the-v0-ifxcu43xz1ze1.jpeg?width=640&crop=smart&auto=webp&s=06376983aabd843f51f4a0f461691dcf02e04520",
    "Apocalypse": "https://i.redd.it/f267am7ut5ib1.jpg",
    "Ego la Planète Vivante": "https://www.fulguropop.com/wp-content/uploads/2019/10/ego-gotg2.png",
    "Maître de l'Évolution": "https://www.marvel-cineverse.fr/medias/images/maitredelevolution-preview-cardvignette.jpg",
    "Gorr le Boucher des Dieux": "https://www.premiere.fr/sites/default/files/styles/partage_rs/public/2022-05/for.jpg",
    "Dormammu": "https://cdn.marvel.com/content/2x/121dmu_ons_mas_mob_03.jpg",
    "Kang le Conquérant": "https://vl-media.fr/wp-content/uploads/2022/01/Kang-le-Conquerant-MCU-comics-Marvel.jpg",
    "Alioth": "https://static.wikia.nocookie.net/marvelstudios/images/9/94/Alioth.jpg/revision/latest?cb=20210712162659&path-prefix=fr",
    "Thanos": "https://www.melty.fr/wp-content/uploads/meltyfr/2022/02/media-69368-750x410.jpg",
    "Galactus": "https://i.redd.it/hope-the-mcu-gives-galactus-a-very-lovecraftian-inspired-v0-bjdicra7rof81.jpg?width=828&format=pjpg&auto=webp&s=9900f761b09d6e03ba952b4d5c88bd4b8ccce467"
  } as Record<string, string>
};

function formatXX(value: number) {
  if (value === 0) return "0.00";
  const suffixes = ["", "k", " Million", " Milliard", " Trill", " Quad", " Quint"];
  const tier = (Math.log10(Math.abs(value)) / 3) | 0;
  if (tier <= 0) return value.toFixed(2);
  const scale = Math.pow(10, tier * 3);
  return (value / scale).toFixed(2) + suffixes[tier];
}

const getBuildingCost = (baseCost: number, count: number) => Math.ceil(baseCost * Math.pow(1.15, count));

function StatItem({ title, value, unit, color, animatePulse = false }: any) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-white/20">
      <p className="text-xs uppercase tracking-[0.15em] text-white/50">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${color ?? "text-white"} ${animatePulse ? "animate-pulse" : ""}`}>
        {value}<span className="ml-1 text-lg text-white/60">{unit}</span>
      </p>
    </article>
  );
}

export default function ResourceDisplay() {
  const store = useGameStore();
  const [bossHitAnim, setBossHitAnim] = useState(false);

  const gemmesGagnables = Math.floor(Math.sqrt(store.energieTotale / 1_000_000_000_000)) - store.gemmesTemporelles;
  const canPrestige = store.energieTotale >= PRESTIGE_THRESHOLD && gemmesGagnables > 0;

  const visibleUpgrades = UPGRADES_DATA.filter(up => {
    if (store.upgradesOwned.includes(up.id)) return false;
    if (!up.reqBuild) return true;
    const countKey = `build${up.reqBuild.charAt(0).toUpperCase() + up.reqBuild.slice(1)}` as keyof typeof store;
    return (store[countKey] as number) >= up.reqCount;
  });

  const availableHeroes = HEROES_DATA.filter(h => !store.herosRecrutes.includes(h.id));

  const bossIndex = (store.bossNiveau - 1) % VILLAINS_LIST.length;
  const loopCount = Math.floor((store.bossNiveau - 1) / VILLAINS_LIST.length);
  const bossKeyName = VILLAINS_LIST[bossIndex];
  const bossName = loopCount > 0 ? `${bossKeyName} C-${loopCount + 1}` : bossKeyName;
  const bossReward = 250 * Math.pow(1.8, store.bossNiveau - 1);
  const bossImageUrl = ASSETS.villains[bossKeyName] || `https://robohash.org/${encodeURIComponent(bossKeyName)}?set=set2&size=150x150`;

  const handleAttackBoss = () => {
    store.attackBoss();
    setBossHitAnim(true);
    setTimeout(() => setBossHitAnim(false), 200);
  };

  return (
    <section className="mx-auto max-w-[1750px] px-4 pb-16 pt-4 font-text text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#04070f] to-[#04070f]"></div>

      <header className="mb-10 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-blue-200 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
          Protocole de Défense Multiverselle ACTIVE
        </div>
        <h1 className="mt-5 font-display text-5xl font-extrabold uppercase tracking-tighter text-white sm:text-7xl">
          Marvel <span className="bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent shadow-red-500/30 [text-shadow:0_0_20px_var(--tw-shadow-color)]">Crisis</span>
        </h1>
      </header>

      <div className={`mb-10 overflow-hidden rounded-3xl border border-red-500/30 bg-slate-950/50 p-6 shadow-2xl backdrop-blur-sm transition-all ${bossHitAnim ? "animate-boss-hit border-red-500" : ""}`}>
        <div className="flex flex-col items-center gap-6 lg:flex-row">
          
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-2 border-red-700 bg-slate-900 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-float overflow-hidden">
            <img 
              src={bossImageUrl} 
              alt={bossName}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute bottom-0 w-full bg-red-600/90 py-0.5 text-center text-xs font-bold uppercase backdrop-blur-sm">Cible</div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">{bossName} <span className="text-red-400 text-xl">(Niv. {store.bossNiveau})</span></h2>
            <p className="mt-1 text-slate-300">Dégâts de l'équipe : <span className="font-bold text-red-300 animate-pulse">{formatXX(store.getCombatPower())} /s</span></p>
            <p className="text-sm text-yellow-400">Récompense de victoire : +{formatXX(bossReward)} Énergie</p>
          </div>
          
          <div className="flex-1 px-4 w-full max-w-xl">
            <div className="mb-1.5 flex justify-between text-sm font-medium">
              <span className="text-slate-200">Points de Vie (PV)</span>
              <span className="text-red-200">{formatXX(Math.max(0, store.bossPv))} / {formatXX(store.bossPvMax)}</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700 p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                style={{ width: `${Math.max(0, (store.bossPv / store.bossPvMax) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleAttackBoss}
            className="rounded-xl bg-red-600 px-10 py-5 text-xl font-bold text-white shadow-[0_5px_0_#b91c1c] transition-colors hover:bg-red-500 active:bg-red-700"
          >
            ATTAQUER
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr_1.1fr]">
        
        <aside className="space-y-8 animate-fade-in [animation-delay:100ms]">
          <div className="rounded-3xl border border-blue-500/20 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
            <StatItem title="Énergie Cosmique" value={formatXX(store.energie)} unit="E" color="text-blue-300" animatePulse />
            <div className="mt-5 space-y-4">
              <StatItem title="Génération Passive" value={formatXX(store.getFinalPerSecond())} unit="/s" color="text-green-300" />
              <StatItem title="Collecte Manuelle (Clic)" value={formatXX(store.getFinalClickPower())} unit="/clic" color="text-yellow-300" />
            </div>
            <button
              onClick={store.generateByClick}
              className="mt-8 w-full rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 py-6 text-xl font-extrabold uppercase tracking-tight text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-colors hover:from-blue-400 hover:to-blue-600"
            >
              Collecter Énergie
            </button>
          </div>

          <div className="rounded-3xl border border-purple-500/20 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
            <StatItem title="Gemmes Temporelles" value={store.gemmesTemporelles.toString()} unit="" color="text-purple-300" />
            <p className="mt-3 text-sm text-slate-300">Boost multiversel actuel : <span className="font-bold text-purple-200">+{((store.prestigeMultiplier - 1) * 100).toFixed(0)}%</span> à tout.</p>
            <button
              onClick={store.performPrestige}
              disabled={!canPrestige}
              className="mt-5 w-full rounded-xl border border-purple-500/50 bg-purple-900/30 py-4 text-lg font-bold transition-colors enabled:hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canPrestige ? `S'élever (+${gemmesGagnables} Gemmes)` : `Requis: ${formatXX(PRESTIGE_THRESHOLD)} Énergie Totale`}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">L'élévation réinitialise tout sauf les Gemmes.</p>
          </div>
        </aside>

        <main className="rounded-3xl border border-slate-700 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl animate-fade-in [animation-delay:200ms]">
          <h2 className="mb-6 font-display text-2xl font-bold text-white tracking-tight">Factions Alliées</h2>
          <div className="grid gap-4 sm:grid-cols-2 max-h-[800px] overflow-y-auto pr-3 custom-scrollbar">
            {Object.keys(BUILDINGS_DATA).map((id) => {
              const data = BUILDINGS_DATA[id];
              const countKey = `build${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof typeof store;
              const count = (store[countKey] as number) || 0; 
              const cost = getBuildingCost(data.baseCost, count);
              const canAfford = store.energie >= cost;

              let bMultiplier = 1;
              store.upgradesOwned.forEach(upId => {
                const upData = UPGRADES_DATA.find(u => u.id === upId);
                if (upData && upData.type === "building" && upData.target === id) bMultiplier *= upData.multiplier;
              });
              const prodTotale = (data.baseProd * count) * bMultiplier * store.globalMultiplier * store.prestigeMultiplier;

              return (
                <button
                  key={id}
                  onClick={() => store.buyBuilding(id)}
                  disabled={!canAfford}
                  className="group flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/80 p-4 text-left transition-colors enabled:hover:border-blue-400 enabled:hover:bg-slate-700/50 disabled:opacity-50"
                >
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-slate-900 border border-slate-600 flex items-center justify-center overflow-hidden">
                    <img 
                      src={ASSETS.factions[id] || `https://ui-avatars.com/api/?name=${id}&background=0f172a&color=38bdf8`} 
                      alt={data.name} 
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-white group-enabled:group-hover:text-blue-200">{data.name}</span>
                      <span className="rounded-md bg-slate-700 px-2.5 py-1 text-sm font-extrabold text-blue-100">{count}</span>
                    </div>
                    <span className="mt-1 block text-xs text-slate-400 line-clamp-1">{data.desc}</span>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs border-t border-slate-700 pt-2">
                      <span className="font-semibold text-blue-300">Coût: {formatXX(cost)}</span>
                      <span className="font-semibold text-green-400">Total: +{formatXX(prodTotale)} /s</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        <aside className="space-y-8 animate-fade-in [animation-delay:300ms]">
          <div className="rounded-3xl border border-green-500/20 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
            <h2 className="mb-5 font-display text-2xl font-bold text-green-400 tracking-tight">Laboratoire Stark</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {visibleUpgrades.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">Aucune technologie disponible.</p>}
              {visibleUpgrades.map(up => (
                <button
                  key={up.id}
                  onClick={() => store.buyUpgrade(up.id)}
                  disabled={store.energie < up.cost}
                  className="w-full rounded-xl border border-green-900 bg-green-950/20 p-4 text-left transition-colors enabled:hover:border-green-500 enabled:hover:bg-green-950/40 disabled:opacity-50"
                >
                  <p className="font-bold text-green-100">{up.name}</p>
                  <p className="text-xs text-green-300/80 mt-0.5">{up.desc} (<span className="font-bold">x{up.multiplier}</span> {up.type === 'click' ? 'Clic' : up.type === 'global' ? 'Global' : 'Faction'})</p>
                  <p className="mt-2.5 text-sm font-bold text-green-400 border-t border-green-800/50 pt-1.5">Coût: {formatXX(up.cost)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-500/20 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
            <h2 className="mb-5 font-display text-2xl font-bold text-orange-400 tracking-tight">Protocoles Avengers</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {availableHeroes.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">Tous les héros sont mobilisés.</p>}
              {availableHeroes.map(hero => (
                <button
                  key={hero.id}
                  onClick={() => store.buyHero(hero.id)}
                  disabled={store.energie < hero.cost}
                  className="group w-full rounded-xl border border-orange-900 bg-orange-950/20 p-4 text-left transition-colors enabled:hover:border-orange-500 enabled:hover:bg-orange-950/40 disabled:opacity-50 flex gap-3 items-center"
                >
                  <img 
                    src={ASSETS.heroes[hero.id] || `https://ui-avatars.com/api/?name=${hero.name}&background=431407&color=fb923c`} 
                    alt={hero.name} 
                    className="h-12 w-12 rounded-full object-cover object-center border border-orange-800 bg-slate-900"
                  />
                  
                  <div className="flex-1">
                    <p className="font-bold text-orange-100">{hero.name}</p>
                    <p className="text-xs text-orange-300/80 mt-0.5">{hero.desc}</p>
                    <div className="mt-2.5 flex justify-between items-center text-sm font-bold text-orange-400 border-t border-orange-800/50 pt-1.5">
                      <span>Coût: {formatXX(hero.cost)}</span>
                      <span className="bg-red-950 text-red-200 px-2 py-0.5 rounded text-xs">Pui: +{formatXX(hero.power)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

      </div>
      
      <footer className="mt-16 text-center text-xs text-slate-600 border-t border-slate-800 pt-8">
        Énergie totale accumulée dans cette réalité : {formatXX(store.energieTotale)}
      </footer>
    </section>
  );
}
