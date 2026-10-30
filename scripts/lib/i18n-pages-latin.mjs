// The Troubleshooting & FAQ and Support pages in German, French, Spanish
// (Spain and Mexico), Italian and Brazilian Portuguese. Keys follow
// ENGLISH_HELP (scripts/lib/help-content.mjs) and SUPPORT_PAGE
// (scripts/lib/pages-more.mjs); every {fact}, {ui:Text}, tag and command is
// the English one (test/i18n.test.mjs checks). A quoted message is a {fact}:
// the build reads it from the addon, in this language once the addon's
// Locales/ file translates it, so nothing quoted is translated here.
// Machine drafts, published as they are (Cliff, 2026-10-26): players' feedback corrects them.

export const PAGES_DE = {
  help: {
    page: {
      description: "Lösungen für häufige Probleme mit Vanguard, mit den eigenen Befehlen und Meldungen des Addons.",
      lede: "Jede Antwort nutzt Vanguards eigene Befehle und zitiert seine echten Meldungen. Öffne eine Frage, um die Lösung zu sehen.",
      glanceStatus: "Fang mit <code>/vg status</code> an: Seine Zeilen zeigen, was geladen ist",
      glanceReport: `Nichts hilft? <a href="/feedback/">Schick einen Bericht</a>`,
      questions: { one: "{n} Frage", other: "{n} Fragen" },
      knownTitle: "Bekannte Probleme",
      known: `<p>Bisher ist kein Problem bestätigt. Vanguard ist eine frühe Version: Noch ist nicht alles im Spiel geprüft, und manche Funktionen werden noch verfeinert. Wenn dir also etwas seltsam vorkommt, sag es uns bitte auf der <a href="/feedback/">Feedback-Seite</a>.</p>
<div class="notice info"><p><strong>Nicht dabei?</strong> Oder hat die Lösung nicht geholfen? Melde es ebenfalls dort, und füge jede Zeile von <code>/vg status</code> bei.</p></div>`,
      ask: "Problem gelöst?",
      thanks: "Bedanke dich auf Ko-fi",
      quote: "„{text}“",
    },
    sections: { fixes: "Schnelle Lösungen", forever: "WoW Forever, Einrichtung und Fehler" },
    entries: {
      "frame-moved": { q: "Ein Rahmen ist außerhalb des Bildschirms oder an der falschen Stelle",
        a: `<p><code>/vg frames</code> listet die Rahmen auf, die du verschieben kannst. <code>/vg reset &lt;frame&gt;</code> setzt einen an seinen Standardplatz zurück, und <code>/vg reset all</code> (oder <strong>{resetAll}</strong> unter <strong>{ui:General} → {ui:Layout}</strong> in <code>/vg</code>) setzt alle Rahmen zurück.</p><p>Um Rahmen selbst zu platzieren, gib <code>/vg unlock</code> ein („{unlockMsg}“), zieh die Griffe und gib dann <code>/vg lock</code> ein.</p>` },
      "look": { q: "Farben oder Schriften sehen falsch aus",
        a: `<p><code>/vg theme reset</code> setzt die Darstellung zurück; seine Hilfezeile sagt: „{themeHelp}“ (das ist auch die Schaltfläche <strong>{resetTheme}</strong> unter <strong>{ui:General} → {ui:Look}</strong>). <code>/vg accent reset</code> setzt nur die Akzentfarbe zurück.</p>` },
      "one-feature": { q: "Ein Teil von Vanguard verhält sich falsch",
        a: `<p>Gib <code>/vg modules</code> ein, um die Teile (Module) zu sehen, dann <code>/vg disable &lt;module&gt;</code> und <code>/reload</code>. Die README sagt: „{keepDefault}“ Die Seite {ui:Modules} im Optionsfenster ergänzt: „{modOff}“</p><p><code>/vg enable &lt;module&gt;</code> und <code>/reload</code> holen ihn zurück. Bitte <a href="/feedback/">melde</a>, was schiefgelaufen ist.</p>` },
      "errors": { q: "Der Chat zeigt einen Fehler von Vanguard",
        a: `<p>Ein Fehler in einem Teil hält die anderen nicht auf: Vanguard hebt ihn auf, und <code>/vg errors</code> listet ihn auf. Die Hilfezeile des Befehls sagt: „{errorsHelp}“.</p><p>Schalte diesen Teil aus (siehe oben) und schick dann einen <a href="/feedback/">Bericht</a> mit der Ausgabe von <code>/vg report</code>.</p>` },
      "report": { q: "Was gehört in einen Fehlerbericht?",
        a: `<p>Gib <code>/vg report</code> ein. Seine Hilfezeile sagt: „{reportHelp}“. Der Block öffnet sich in einem Feld, bereits markiert; der Titel des Felds lautet „{reportTitle}“. Füge ihn vollständig in das <a href="/feedback/">Feedback</a>-Formular ein, zusammen mit dem, was du getan hast und was passiert ist.</p>` },
      "broken": { q: "Alles ist kaputt",
        a: `<p><code>/vg profile reset</code> fragt zuerst („{profResetAsk}“), behält eine Kopie des Profils, das du nutzt, und setzt es auf die Standardwerte zurück („{profReset}“); lade danach neu.</p><p>Um zu testen, ohne deine Einstellungen zu verlieren, stell diesen Charakter stattdessen auf ein neues, leeres Profil um: <code>/vg profile Test</code>. Das passiert beim nächsten Neuladen: „{nextSwitch}“ Siehe <a href="/profiles/">Profile</a>.</p>` },
      "import": { q: "Der Import ist fehlgeschlagen",
        a: `<p>Wenn sich ein Import-Text nicht verwenden lässt, sagt Vanguard „{importFailed}“ und einen dieser Gründe:</p>{reasons}<p>Meistens wurde der Text beim Kopieren oder Einfügen abgeschnitten: Exportiere ihn noch einmal und kopiere ihn vollständig.</p>` },
      "health-hidden": { q: "Manche Zahlen erscheinen in Instanzen nicht",
        a: `<p>Der Spielclient verbirgt manche Werte vor Addons, zum Beispiel im Kampf in Instanzen. Die README sagt über diese Werte: „{unread}“. Die Leisten füllen sich trotzdem, aber Vanguard kann keine Zahl anzeigen, die es nicht lesen darf. Das ist so gewollt. <code>/vg status</code> meldet „{auraHidden}“, wenn Aurawerte verborgen sind.</p>` },
      "reload": { q: "Eine Einstellung hat nichts geändert",
        a: `<p>Einstellungen, die auf der Seite <a href="/settings/">Einstellungen</a> mit {RELOAD} markiert sind, wirken nach dem Neuladen: Das Optionsfenster bietet dafür die Schaltfläche <strong>{ui:Reload now}</strong> an. Die Neulade-Schaltflächen sind so gebaut, wie WoW Forever es erlaubt. Eine, die während eines Kampfes entsteht, funktioniert, sobald der Kampf endet; bis dahin sagt sie „{typeReload}“</p>` },
      "combat": { q: "Im Kampf lässt sich etwas nicht ändern",
        a: `<p>Manche Änderungen sind im Kampf nicht möglich. Vanguard hält sie zurück und führt sie aus, wenn der Kampf endet. Die zweite Zeile von <code>/vg status</code> zählt sie: „&lt;n&gt; {waiting}“.</p>` },
      "renamed": { q: "Wo ist ForeverUI geblieben?",
        a: `<p>Es heißt jetzt Vanguard: dasselbe Addon, umbenannt, weil ein anderes, nicht verwandtes Addon als ForeverUI veröffentlicht ist. Die Befehle sind <code>/vg</code> und <code>/vanguard</code> statt <code>/fui</code>. Deine Einstellungen ziehen nicht von selbst um: Gib vor dem Update <code>/fui export</code> ein und heb den Text auf; nach dem Update fügst du ihn mit <code>/vg import</code> ein. Siehe <a href="/install/#renamed">Installieren &amp; Aktualisieren</a>.</p>` },
      "settings-lost": { q: "Meine Einstellungen werden bei jedem Spielstart zurückgesetzt",
        a: `<p>Der Code des Addons hält fest, dass Beta-Builds von WoW Forever, die älter als {fixedBuild} sind, die Addon-Einstellungen bei jedem Start verlieren und die Schlachtzugsrahmen, das Klickzaubern und den Leistenwechsel stören. Aktualisiere das Spiel. Auf einem älteren Build sagt <code>/vg status</code>: „{buildWarn}“.</p>` },
      "hover-keys": { q: "Hover-Tasten funktionieren nicht",
        a: `<p>Manche Beta-Clients von WoW Forever können den Code, den Hover-Tasten brauchen, nicht ausführen. Vanguard sagt dann beim Einloggen: „{snipChat}“, und <code>/vg status</code> zeigt „{noSnip}“. Die Seite {ui:Click casting} sagt: „{ccNote}“</p><p>Klickzaubern mit der Maus funktioniert weiter, Leiste 1 wechselt weiter mit Haltungen, Gestalten und Umschalt+Zahl, und die Schlachtzugsrahmen funktionieren auch.</p>` },
      "setup": { q: "Der Einrichtungsassistent hat sich nicht geöffnet",
        a: `<p>Der Einrichtungsassistent öffnet sich, wenn du dich zum ersten Mal mit einem Account einloggst. Bist du im Kampf, wartet er: „{setupCombat}“ Wenn du ihn beendet oder geschlossen hast, öffnest du ihn wieder mit <code>/vg setup</code> oder <strong>{ui:Run setup}</strong> unter <strong>{ui:General} → {ui:Layout}</strong> in <code>/vg</code>.</p>` },
      "edit-mode": { q: "Vanguards Rahmen erscheinen nicht im Bearbeitungsmodus",
        a: `<p>Wenn du den Bearbeitungsmodus des Spiels öffnest, erscheinen auch Vanguards Griffe, mit einem Hinweis: „{editNote}“ Falls nicht, setz unter <strong>{ui:General} → {ui:Layout}</strong> in <code>/vg</code> ein Häkchen bei <strong>{editOpt}</strong>.</p><p>Die Spielrahmen, die Vanguard ausblendet oder ersetzt (Aktionsleisten, Erfahrungs- und Rufleisten, Einheitenrahmen und so weiter), bekommen absichtlich keinen Griff im Bearbeitungsmodus. Verschiebe stattdessen Vanguards Rahmen.</p>` },
      "edit-layout": { q: "Der Chat sagt, mein Profil nutzt ein Layout des Bearbeitungsmodus, das dieser Account nicht hat",
        a: `<p>Ein Profil merkt sich, welches Layout des Bearbeitungsmodus du damit nutzt. Lädt ein Charakter dieses Profil, stellt Vanguard den Bearbeitungsmodus auf das Layout mit diesem Namen um, falls dein Account eins hat. Falls nicht, sagt Vanguard „{editMissing}“ und lässt den Bearbeitungsmodus, wie er ist.</p>` },
      "errors-badge": { q: "Auf der Addon-Schaltfläche steht eine rote Zahl",
        a: `<p>So viele Fehler hat Vanguard in dieser Sitzung abgefangen. Die Fußzeile des Optionsfensters sagt dasselbe („{footerLine}“). Klick auf diese Zeile oder gib <code>/vg errors</code> ein, um sie aufzulisten; die Schaltfläche <strong>{errorsReport}</strong> der Liste öffnet Vanguards Feedback-Formular für einen Fehler, mit der Liste im Anhang, oder du fügst sie hier in einen <a href="/feedback/">Fehlerbericht</a> ein. Ihre Schaltfläche <strong>{errorsClear}</strong> (oder <code>/vg errors clear</code>) leert die Liste, und die Zahl verschwindet. Ist nichts abgefangen, sagt <code>/vg errors</code> „{noErrors}“</p>` },
      "language": { q: "Gibt es Vanguard in meiner Sprache?",
        a: `<p>Vanguards eigener Text (das Optionsfenster, die Einrichtung, Chatzeilen und Tooltips) erscheint in der Sprache deines Clients: Deutsch, Französisch, Spanisch (Spanien und Lateinamerika), Italienisch, brasilianisches Portugiesisch, Russisch, Koreanisch und Chinesisch (vereinfacht und traditionell), sonst überall Englisch. Namen, die das Spiel liefert (Zauber, Gegenstände, Gebiete), bleiben in der Sprache deines Clients.</p><p>Die Übersetzungen sind neu und maschinell entworfen, daher klingen manche Zeilen holprig. Wenn dir eine auffällt, sag es uns bitte auf der <a href="/feedback/">Feedback-Seite</a> (oder im Spiel mit <code>/vg feedback</code>): Zitiere die Zeile, nenne deine Sprache und schreib, wenn du kannst, wie sie lauten sollte. Die Befehle, die du eingibst, bleiben englisch.</p>` },
      "perf": { q: "Bremst Vanguard mein Spiel aus?",
        a: `<p><code>/vg perf</code> zeigt Vanguards aktuelle CPU-Zeit und Speichernutzung sowie seine zehn am stärksten beschäftigten Funktionen. So misst du die CPU-Kosten selbst (die README: „{perfRecipe}“):</p><ol class="steps"><li>Gib <code>/vg perf cpu</code> ein, dann <code>/reload</code>.</li><li>Spiel eine Weile (ein Pull im Schlachtzug ist der schwierige Fall).</li><li>Gib <code>/vg perf</code> ein und lies die Zahlen.</li><li>Gib noch einmal <code>/vg perf cpu</code> und <code>/reload</code> ein. Messen hat seinen Preis; die README sagt: „{perfSlows}“.</li></ol><p>Es sind noch keine Leistungszahlen veröffentlicht.</p>` },
      "retail": { q: "Funktioniert Vanguard in Retail-WoW?",
        a: `<p>Vanguard ist für WoW Forever gemacht. Es lädt auch in Retail-WoW, aber Retail wird noch nicht unterstützt: Die Klassen und Systeme, die es nur in Retail gibt (etwa Mythisch+, Tiefen und Behausungen), sind nicht abgedeckt, und manches funktioniert dort vielleicht nicht.</p><p>Volle Retail-Unterstützung ist für eine spätere Version geplant. Wenn du bis dahin Retail spielst und etwas nicht geht, sag es uns bitte auf der <a href="/feedback/">Feedback-Seite</a> und erwähne, dass du Retail spielst.</p>` },
    },
  },
  support: {
    description: "Vanguard ist kostenlos und wird von einer Person gemacht. Hier steht, wofür Unterstützung bezahlt, wie du sie gibst und wie du sonst helfen kannst.",
    lede: "Vanguard ist kostenlos und bleibt es. Unterstützung ist ein Dankeschön, nie eine Pflicht.",
    paysTitle: "Wofür Unterstützung bezahlt",
    pays: `<p>Vanguard wird von einer Person gemacht. Unterstützung bezahlt die Zeit, es am Laufen zu halten, wenn Patches WoW Forever verändern, und zu beheben, was Spieler melden.</p>
<p>Sie schaltet nie etwas frei: Jeder Teil von Vanguard funktioniert für alle gleich.</p>`,
    giveTitle: "Über Ko-fi geben",
    giveButton: "Vanguard auf Ko-fi unterstützen",
    giveNote: "Ko-fi wickelt die Zahlung ab und zeigt seine eigenen Optionen. Nichts davon wird an Vanguard oder diese Website gesendet.",
    otherTitle: "Kein Geld übrig? Das hilft auch",
    other: `<ul>
  <li>Erzähl anderen Spielern von Vanguard.</li>
  <li>Schick einen Fehlerbericht oder eine Idee über die <a href="/feedback/">Feedback-Seite</a>.</li>
  <li>Füge die Zeilen von <code>/vg status</code> bei, wenn etwas schiefgeht, damit es schneller behoben werden kann.</li>
</ul>`,
    follow: "Folge {x} auf X für Neuigkeiten, und sprich mit anderen Spielern auf {discord}.",
  },
};

export const PAGES_FR = {
  help: {
    page: {
      description: "Solutions aux problèmes courants de Vanguard, avec les commandes et les messages de l’addon lui-même.",
      lede: "Chaque réponse utilise les commandes de Vanguard et cite ses vrais messages. Ouvrez une question pour voir la solution.",
      glanceStatus: "Commencez par <code>/vg status</code> : ses lignes disent ce qui est chargé",
      glanceReport: `Rien n’y fait ? <a href="/feedback/">Envoyez un rapport</a>`,
      questions: { one: "{n} question", other: "{n} questions", many: "{n} questions" },
      knownTitle: "Problèmes connus",
      known: `<p>Aucun problème connu n’a encore été confirmé. Vanguard est une version précoce : tout n’a pas encore été vérifié en jeu, et certaines fonctions sont encore en cours de finition. Si quelque chose vous semble anormal, dites-le-nous sur la <a href="/feedback/">page Feedback</a>.</p>
<div class="notice info"><p><strong>Votre cas n’est pas traité ici ?</strong> Ou la solution n’a pas aidé ? Signalez-le aussi là-bas, avec toutes les lignes de <code>/vg status</code>.</p></div>`,
      ask: "Problème résolu ?",
      thanks: "Dites merci sur Ko-fi",
      quote: "« {text} »",
    },
    sections: { fixes: "Solutions rapides", forever: "WoW Forever, configuration et erreurs" },
    entries: {
      "frame-moved": { q: "Un cadre est hors de l’écran ou au mauvais endroit",
        a: `<p><code>/vg frames</code> liste les cadres que vous pouvez déplacer. <code>/vg reset &lt;frame&gt;</code> en remet un à sa place par défaut, et <code>/vg reset all</code> (ou <strong>{resetAll}</strong> dans <strong>{ui:General} → {ui:Layout}</strong> de <code>/vg</code>) les remet tous en place.</p><p>Pour placer les cadres vous-même, tapez <code>/vg unlock</code> (« {unlockMsg} »), faites glisser les poignées, puis tapez <code>/vg lock</code>.</p>` },
      "look": { q: "Les couleurs ou les polices ont l’air fausses",
        a: `<p><code>/vg theme reset</code> remet le thème par défaut ; sa ligne d’aide dit : « {themeHelp} » (c’est aussi le bouton <strong>{resetTheme}</strong> dans <strong>{ui:General} → {ui:Look}</strong>). <code>/vg accent reset</code> ne réinitialise que la couleur d’accent.</p>` },
      "one-feature": { q: "Une partie de Vanguard se comporte mal",
        a: `<p>Tapez <code>/vg modules</code> pour voir les parties (modules), puis <code>/vg disable &lt;module&gt;</code> et <code>/reload</code>. Le README dit : « {keepDefault} » La page {ui:Modules} de la fenêtre d’options ajoute : « {modOff} »</p><p><code>/vg enable &lt;module&gt;</code> et <code>/reload</code> la rétablissent. Merci de <a href="/feedback/">signaler</a> ce qui n’a pas marché.</p>` },
      "errors": { q: "Le chat affiche une erreur de Vanguard",
        a: `<p>Une erreur dans une partie n’arrête pas les autres : Vanguard la conserve, et <code>/vg errors</code> la liste. La ligne d’aide de la commande dit : « {errorsHelp} ».</p><p>Désactivez cette partie (voir plus haut), puis envoyez un <a href="/feedback/">rapport</a> contenant <code>/vg report</code>.</p>` },
      "report": { q: "Que mettre dans un rapport de bug ?",
        a: `<p>Tapez <code>/vg report</code>. Sa ligne d’aide dit : « {reportHelp} ». Le texte s’ouvre dans une fenêtre, déjà sélectionné ; le titre de la fenêtre dit « {reportTitle} ». Collez-le en entier dans le formulaire <a href="/feedback/">Feedback</a>, avec ce que vous avez fait et ce qui s’est passé.</p>` },
      "broken": { q: "Plus rien ne marche",
        a: `<p><code>/vg profile reset</code> demande d’abord (« {profResetAsk} »), garde une copie du profil que vous utilisez et le remet aux valeurs par défaut (« {profReset} ») ; rechargez ensuite.</p><p>Pour tester sans perdre vos réglages, passez plutôt ce personnage sur un nouveau profil vide : <code>/vg profile Test</code>. Le changement se fait au prochain rechargement : « {nextSwitch} » Voir <a href="/profiles/">Profils</a>.</p>` },
      "import": { q: "L’import a échoué",
        a: `<p>Quand une chaîne d’import ne peut pas être utilisée, Vanguard dit « {importFailed} » suivi de l’une de ces raisons :</p>{reasons}<p>Le plus souvent, la chaîne a été coupée en la copiant ou en la collant : exportez-la de nouveau et copiez-la en entier.</p>` },
      "health-hidden": { q: "Certains nombres ne s’affichent pas en instance",
        a: `<p>Le client du jeu cache certaines valeurs aux addons, par exemple en combat dans une instance. Le README dit de ces valeurs : « {unread} ». Les barres se remplissent quand même, mais Vanguard ne peut pas afficher un nombre qu’il n’a pas le droit de lire. C’est normal. <code>/vg status</code> indique « {auraHidden} » quand les valeurs des auras sont cachées.</p>` },
      "reload": { q: "Un réglage n’a rien changé",
        a: `<p>Les réglages marqués {RELOAD} sur la page <a href="/settings/">Paramètres</a> s’appliquent après un rechargement : la fenêtre d’options propose un bouton <strong>{ui:Reload now}</strong>. Les boutons de rechargement sont faits comme WoW Forever le permet. Un bouton créé pendant un combat fonctionne une fois le combat terminé ; d’ici là, il dit « {typeReload} »</p>` },
      "combat": { q: "Quelque chose ne change pas pendant un combat",
        a: `<p>Certains changements ne peuvent pas être faits en combat. Vanguard les garde et les applique à la fin du combat. La deuxième ligne de <code>/vg status</code> les compte : « &lt;n&gt; {waiting} ».</p>` },
      "renamed": { q: "Où est passé ForeverUI ?",
        a: `<p>C’est Vanguard maintenant : le même addon, renommé parce qu’un autre addon, sans rapport, est publié sous le nom ForeverUI. Les commandes sont <code>/vg</code> et <code>/vanguard</code> au lieu de <code>/fui</code>. Vos réglages ne suivent pas tout seuls : avant la mise à jour, tapez <code>/fui export</code> et gardez le texte ; après la mise à jour, importez-le avec <code>/vg import</code>. Voir <a href="/install/#renamed">Installer et mettre à jour</a>.</p>` },
      "settings-lost": { q: "Mes réglages sont réinitialisés à chaque lancement du jeu",
        a: `<p>Le code de l’addon note que les versions bêta de WoW Forever antérieures au build {fixedBuild} perdent les réglages des addons à chaque lancement, et cassent les cadres de raid, le clic-sort et le changement de page des barres. Mettez le jeu à jour. Sur un build plus ancien, <code>/vg status</code> dit : « {buildWarn} ».</p>` },
      "hover-keys": { q: "Les touches de survol ne marchent pas",
        a: `<p>Certains clients bêta de WoW Forever ne peuvent pas exécuter le code dont les touches de survol ont besoin. Vanguard le dit alors à la connexion : « {snipChat} », et <code>/vg status</code> affiche « {noSnip} ». La page {ui:Click casting} dit : « {ccNote} »</p><p>Le clic-sort à la souris marche toujours, la barre 1 change toujours avec les postures, les formes et Maj+chiffre, et les cadres de raid marchent toujours.</p>` },
      "setup": { q: "L’assistant de configuration ne s’est pas ouvert",
        a: `<p>L’assistant de configuration s’ouvre la première fois que vous vous connectez sur un compte. Si vous êtes en combat, il attend : « {setupCombat} » Une fois terminé ou fermé, rouvrez-le avec <code>/vg setup</code> ou <strong>{ui:Run setup}</strong> dans <strong>{ui:General} → {ui:Layout}</strong> de <code>/vg</code>.</p>` },
      "edit-mode": { q: "Les cadres de Vanguard n’apparaissent pas en mode Édition",
        a: `<p>Quand vous ouvrez le mode Édition du jeu, les poignées de Vanguard apparaissent aussi, avec une note : « {editNote} » Sinon, cochez <strong>{editOpt}</strong> dans <strong>{ui:General} → {ui:Layout}</strong> de <code>/vg</code>.</p><p>Les cadres du jeu que Vanguard cache ou remplace (ses barres d’action, barres d’expérience et de réputation, cadres d’unité, etc.) n’ont volontairement pas de poignée en mode Édition. Déplacez plutôt les cadres de Vanguard.</p>` },
      "edit-layout": { q: "Le chat dit que mon profil utilise une disposition du mode Édition que ce compte n’a pas",
        a: `<p>Un profil retient quelle disposition du mode Édition du jeu vous utilisez avec lui. Quand un personnage charge ce profil, Vanguard passe le mode Édition sur la disposition de ce nom, si votre compte en a une. Sinon, Vanguard dit « {editMissing} » et laisse le mode Édition tel quel.</p>` },
      "errors-badge": { q: "Il y a un nombre rouge sur le bouton des addons",
        a: `<p>C’est le nombre d’erreurs que Vanguard a interceptées pendant cette session. Le pied de la fenêtre d’options dit la même chose (« {footerLine} »). Cliquez sur cette ligne ou tapez <code>/vg errors</code> pour les lister ; le bouton <strong>{errorsReport}</strong> de la liste ouvre le formulaire de feedback de Vanguard sur un bug, avec la liste jointe, ou vous pouvez la coller ici dans un <a href="/feedback/">rapport de bug</a>. Son bouton <strong>{errorsClear}</strong> (ou <code>/vg errors clear</code>) vide la liste, et le nombre disparaît. Quand rien n’a été intercepté, <code>/vg errors</code> dit « {noErrors} »</p>` },
      "language": { q: "Vanguard est-il dans ma langue ?",
        a: `<p>Le texte propre à Vanguard (la fenêtre d’options, la configuration, les lignes de chat et les infobulles) s’affiche dans la langue de votre client : allemand, français, espagnol (Espagne et Amérique latine), italien, portugais du Brésil, russe, coréen et chinois (simplifié et traditionnel), et en anglais partout ailleurs. Les noms fournis par le jeu (sorts, objets, zones) restent dans la langue de votre client.</p><p>Les traductions sont nouvelles et rédigées par machine, donc certaines lignes sonneront faux. Quand c’est le cas, dites-le-nous sur la <a href="/feedback/">page Feedback</a> (ou avec <code>/vg feedback</code> dans le jeu) : citez la ligne, indiquez votre langue et, si vous le pouvez, comment elle devrait se lire. Les commandes que vous tapez restent en anglais.</p>` },
      "perf": { q: "Vanguard ralentit-il mon jeu ?",
        a: `<p><code>/vg perf</code> affiche le temps CPU et la mémoire de Vanguard en ce moment, ainsi que ses dix fonctions les plus actives. Pour mesurer vous-même le coût CPU (le README : « {perfRecipe} ») :</p><ol class="steps"><li>Tapez <code>/vg perf cpu</code>, puis <code>/reload</code>.</li><li>Jouez un moment (un pull de raid est le cas difficile).</li><li>Tapez <code>/vg perf</code> et lisez les chiffres.</li><li>Tapez de nouveau <code>/vg perf cpu</code> et <code>/reload</code>. Mesurer a un coût ; le README dit : « {perfSlows} ».</li></ol><p>Aucun chiffre de performance n’est encore publié.</p>` },
      "retail": { q: "Vanguard fonctionne-t-il sur WoW Retail ?",
        a: `<p>Vanguard est conçu pour WoW Forever. Il se charge aussi sur WoW Retail, mais Retail n’est pas encore pris en charge : les classes et les systèmes propres à Retail (comme les donjons Mythique+, les gouffres et le logis) ne sont pas couverts, et certaines parties peuvent ne pas fonctionner.</p><p>La prise en charge complète de Retail est prévue pour une version ultérieure. D’ici là, si vous jouez sur Retail et que quelque chose ne marche pas, dites-le-nous sur la <a href="/feedback/">page Retours</a> en précisant que vous êtes sur Retail.</p>` },
    },
  },
  support: {
    description: "Vanguard est gratuit et fait par une seule personne. Voici ce que le soutien finance, comment le donner, et d’autres façons d’aider.",
    lede: "Vanguard est gratuit, et le restera. Le soutien est un merci, jamais une obligation.",
    paysTitle: "Ce que le soutien finance",
    pays: `<p>Vanguard est fait par une seule personne. Le soutien finance le temps de le garder en état de marche au fil des patchs de WoW Forever, et de corriger ce que les joueurs signalent.</p>
<p>Il ne débloque jamais rien : chaque partie de Vanguard marche de la même façon pour tout le monde.</p>`,
    giveTitle: "Donner sur Ko-fi",
    giveButton: "Soutenir Vanguard sur Ko-fi",
    giveNote: "Ko-fi gère le paiement et affiche ses propres options. Rien n’est envoyé à Vanguard ni à ce site.",
    otherTitle: "Pas les moyens ? Ceci aide aussi",
    other: `<ul>
  <li>Parlez de Vanguard à d’autres joueurs.</li>
  <li>Envoyez un rapport de bug ou une idée sur la <a href="/feedback/">page Feedback</a>.</li>
  <li>Joignez les lignes de <code>/vg status</code> quand quelque chose ne va pas, pour que ce soit corrigé plus vite.</li>
</ul>`,
    follow: "Suivez {x} sur X pour les actualités, et discutez avec d’autres joueurs sur {discord}.",
  },
};

export const PAGES_ES = {
  help: {
    page: {
      description: "Soluciones a problemas comunes de Vanguard, con los propios comandos y mensajes del addon.",
      lede: "Cada respuesta usa los comandos de Vanguard y cita sus mensajes reales. Abre una pregunta para ver la solución.",
      glanceStatus: "Empieza por <code>/vg status</code>: sus líneas dicen qué está cargado",
      glanceReport: `¿Nada te sirve? <a href="/feedback/">Envía un informe</a>`,
      questions: { one: "{n} pregunta", other: "{n} preguntas", many: "{n} preguntas" },
      knownTitle: "Problemas conocidos",
      known: `<p>Todavía no se ha confirmado ningún problema conocido. Vanguard es una versión temprana: aún no se ha comprobado todo en el juego y algunas funciones se siguen puliendo, así que si algo no se ve bien, cuéntanoslo en la <a href="/feedback/">página de Feedback</a>.</p>
<div class="notice info"><p><strong>¿No aparece aquí?</strong> ¿O la solución no ha servido? Infórmalo allí también e incluye todas las líneas de <code>/vg status</code>.</p></div>`,
      ask: "¿Problema resuelto?",
      thanks: "Da las gracias en Ko-fi",
      quote: "«{text}»",
    },
    sections: { fixes: "Soluciones rápidas", forever: "WoW Forever, configuración y errores" },
    entries: {
      "frame-moved": { q: "Un marco está fuera de la pantalla o en un sitio equivocado",
        a: `<p><code>/vg frames</code> muestra los marcos que puedes mover. <code>/vg reset &lt;frame&gt;</code> devuelve uno a su sitio predeterminado, y <code>/vg reset all</code> (o <strong>{resetAll}</strong> en <strong>{ui:General} → {ui:Layout}</strong> dentro de <code>/vg</code>) los devuelve todos.</p><p>Para colocar los marcos tú mismo, escribe <code>/vg unlock</code> («{unlockMsg}»), arrastra los tiradores y luego escribe <code>/vg lock</code>.</p>` },
      "look": { q: "Los colores o las fuentes se ven mal",
        a: `<p><code>/vg theme reset</code> restablece el tema; su línea de ayuda dice: «{themeHelp}» (también es el botón <strong>{resetTheme}</strong> en <strong>{ui:General} → {ui:Look}</strong>). <code>/vg accent reset</code> restablece solo el color de acento.</p>` },
      "one-feature": { q: "Una parte de Vanguard falla",
        a: `<p>Escribe <code>/vg modules</code> para ver las partes (módulos) y luego <code>/vg disable &lt;module&gt;</code> y <code>/reload</code>. El README dice: «{keepDefault}» La página {ui:Modules} de la ventana de opciones añade: «{modOff}»</p><p><code>/vg enable &lt;module&gt;</code> y <code>/reload</code> la recuperan. Por favor, <a href="/feedback/">informa</a> de lo que falló.</p>` },
      "errors": { q: "El chat muestra un error de Vanguard",
        a: `<p>Un error en una parte no detiene las demás: Vanguard lo guarda y <code>/vg errors</code> lo muestra. La línea de ayuda del comando dice: «{errorsHelp}».</p><p>Desactiva esa parte (ver arriba) y luego envía un <a href="/feedback/">informe</a> con el texto de <code>/vg report</code>.</p>` },
      "report": { q: "¿Qué pongo en un informe de errores?",
        a: `<p>Escribe <code>/vg report</code>. Su línea de ayuda dice: «{reportHelp}». Se abre en un cuadro, ya seleccionado; el título del cuadro dice «{reportTitle}». Pégalo entero en el formulario de <a href="/feedback/">Feedback</a>, junto con lo que hiciste y lo que pasó.</p>` },
      "broken": { q: "Todo está roto",
        a: `<p><code>/vg profile reset</code> pregunta primero («{profResetAsk}»), guarda una copia del perfil que usas y lo devuelve a los valores predeterminados («{profReset}»); después recarga.</p><p>Para probar sin perder tus ajustes, cambia este personaje a un perfil nuevo y vacío: <code>/vg profile Test</code>. El cambio ocurre en la próxima recarga: «{nextSwitch}» Consulta <a href="/profiles/">Perfiles</a>.</p>` },
      "import": { q: "La importación ha fallado",
        a: `<p>Cuando una cadena de importación no se puede usar, Vanguard dice «{importFailed}» y uno de estos motivos:</p>{reasons}<p>Lo más habitual es que la cadena se cortara al copiarla o pegarla: expórtala otra vez y cópiala entera.</p>` },
      "health-hidden": { q: "Algunos números no se muestran en las instancias",
        a: `<p>El cliente del juego oculta algunos valores a los addons, por ejemplo en combate dentro de instancias. El README dice de esos valores: «{unread}». Las barras se siguen llenando, pero Vanguard no puede mostrar un número que no tiene permitido leer. Es lo esperado. <code>/vg status</code> dice «{auraHidden}» cuando los valores de las auras están ocultos.</p>` },
      "reload": { q: "Un ajuste no ha cambiado nada",
        a: `<p>Los ajustes marcados con {RELOAD} en la página <a href="/settings/">Ajustes</a> se aplican tras recargar: la ventana de opciones ofrece un botón <strong>{ui:Reload now}</strong>. Los botones de recarga están hechos como lo permite WoW Forever. Uno creado durante un combate funciona cuando termina el combate; hasta entonces dice «{typeReload}»</p>` },
      "combat": { q: "Algo no cambia durante un combate",
        a: `<p>Algunos cambios no se pueden hacer en combate. Vanguard los guarda y los aplica cuando termina el combate. La segunda línea de <code>/vg status</code> los cuenta: «&lt;n&gt; {waiting}».</p>` },
      "renamed": { q: "¿Dónde está ForeverUI?",
        a: `<p>Ahora se llama Vanguard: es el mismo addon, renombrado porque otro addon, sin relación, se publica como ForeverUI. Los comandos son <code>/vg</code> y <code>/vanguard</code> en lugar de <code>/fui</code>. Tus ajustes no se pasan solos: antes de actualizar, escribe <code>/fui export</code> y guarda el texto; después de actualizar, impórtalo con <code>/vg import</code>. Consulta <a href="/install/#renamed">Instalar y actualizar</a>.</p>` },
      "settings-lost": { q: "Mis ajustes se restablecen cada vez que inicio el juego",
        a: `<p>El código del addon indica que las versiones beta de WoW Forever anteriores a la compilación {fixedBuild} pierden los ajustes de los addons en cada inicio y estropean los marcos de banda, el lanzamiento con clic y el cambio de página de las barras. Actualiza el juego. En una compilación anterior, <code>/vg status</code> dice: «{buildWarn}».</p>` },
      "hover-keys": { q: "Las teclas al pasar el cursor no funcionan",
        a: `<p>Algunos clientes beta de WoW Forever no pueden ejecutar el código que necesitan las teclas al pasar el cursor. Vanguard lo dice entonces al conectarte: «{snipChat}», y <code>/vg status</code> muestra «{noSnip}». La página {ui:Click casting} dice: «{ccNote}»</p><p>El lanzamiento con clic del ratón sigue funcionando, la barra 1 sigue cambiando con actitudes, formas y Mayús+número, y los marcos de banda siguen funcionando.</p>` },
      "setup": { q: "El asistente de configuración no se abrió",
        a: `<p>El asistente de configuración se abre la primera vez que te conectas con una cuenta. Si estás en combate, espera: «{setupCombat}» Cuando lo hayas terminado o cerrado, ábrelo de nuevo con <code>/vg setup</code> o <strong>{ui:Run setup}</strong> en <strong>{ui:General} → {ui:Layout}</strong> dentro de <code>/vg</code>.</p>` },
      "edit-mode": { q: "Los marcos de Vanguard no aparecen en el modo Edición",
        a: `<p>Cuando abres el modo Edición del juego, también aparecen los tiradores de Vanguard, con una nota: «{editNote}» Si no aparecen, marca <strong>{editOpt}</strong> en <strong>{ui:General} → {ui:Layout}</strong> dentro de <code>/vg</code>.</p><p>Los marcos del juego que Vanguard oculta o sustituye (sus barras de acción, las barras de experiencia y reputación, los marcos de unidad, etc.) no tienen tirador en el modo Edición a propósito. Mueve en su lugar los marcos de Vanguard.</p>` },
      "edit-layout": { q: "El chat dice que mi perfil usa un diseño del modo Edición que esta cuenta no tiene",
        a: `<p>Un perfil recuerda qué diseño del modo Edición del juego usas con él. Cuando un personaje carga ese perfil, Vanguard cambia el modo Edición al diseño con ese nombre, si tu cuenta tiene uno. Si no lo tiene, Vanguard dice «{editMissing}» y deja el modo Edición como está.</p>` },
      "errors-badge": { q: "Hay un número rojo en el botón de addons",
        a: `<p>Es el número de errores que Vanguard ha capturado en esta sesión. El pie de la ventana de opciones dice lo mismo («{footerLine}»). Haz clic en esa línea o escribe <code>/vg errors</code> para verlos; el botón <strong>{errorsReport}</strong> de la lista abre el formulario de feedback de Vanguard sobre un error con la lista adjunta, o puedes pegarla aquí en un <a href="/feedback/">informe de error</a>. Su botón <strong>{errorsClear}</strong> (o <code>/vg errors clear</code>) vacía la lista y el número desaparece. Si no se ha capturado nada, <code>/vg errors</code> dice «{noErrors}»</p>` },
      "language": { q: "¿Está Vanguard en mi idioma?",
        a: `<p>El texto propio de Vanguard (la ventana de opciones, la configuración, las líneas del chat y los tooltips) se muestra en el idioma de tu cliente: alemán, francés, español (España y Latinoamérica), italiano, portugués de Brasil, ruso, coreano y chino (simplificado y tradicional), y en inglés en todos los demás. Los nombres que da el juego (hechizos, objetos, zonas) siguen en el idioma de tu cliente.</p><p>Las traducciones son nuevas y están hechas a máquina, así que algunas líneas sonarán raras. Cuando veas una, dínoslo en la <a href="/feedback/">página de Feedback</a> (o con <code>/vg feedback</code> en el juego): cita la línea, di tu idioma y, si puedes, cómo debería decirse. Los comandos que escribes siguen en inglés.</p>` },
      "perf": { q: "¿Vanguard ralentiza mi juego?",
        a: `<p><code>/vg perf</code> muestra el tiempo de CPU y la memoria de Vanguard en este momento, y sus diez funciones más ocupadas. Para medir tú mismo el coste de CPU (el README: «{perfRecipe}»):</p><ol class="steps"><li>Escribe <code>/vg perf cpu</code> y luego <code>/reload</code>.</li><li>Juega un rato (un pull de banda es el caso difícil).</li><li>Escribe <code>/vg perf</code> y lee los números.</li><li>Escribe otra vez <code>/vg perf cpu</code> y <code>/reload</code>. Medir tiene un coste; el README dice: «{perfSlows}».</li></ol><p>Todavía no se han publicado cifras de rendimiento.</p>` },
      "retail": { q: "¿Vanguard funciona en WoW Retail?",
        a: `<p>Vanguard está hecho para WoW Forever. También se carga en WoW Retail, pero Retail aún no tiene soporte: las clases y los sistemas que solo tiene Retail (como las mazmorras Míticas+, las profundidades y las casas) no están cubiertos, y algunas partes pueden no funcionar.</p><p>El soporte completo para Retail está previsto para una versión posterior. Hasta entonces, si juegas en Retail y algo falla, avísanos en la <a href="/feedback/">página de comentarios</a> y di que juegas en Retail.</p>` },
    },
  },
  support: {
    description: "Vanguard es gratis y lo hace una sola persona. Aquí tienes lo que paga el apoyo, cómo darlo y otras formas de ayudar.",
    lede: "Vanguard es gratis y siempre lo será. El apoyo es un agradecimiento, nunca una obligación.",
    paysTitle: "Qué paga el apoyo",
    pays: `<p>Vanguard lo hace una sola persona. El apoyo paga el tiempo para mantenerlo funcionando a medida que los parches de WoW Forever cambian cosas, y para arreglar lo que informan los jugadores.</p>
<p>Nunca desbloquea nada: cada parte de Vanguard funciona igual para todos.</p>`,
    giveTitle: "Aportar en Ko-fi",
    giveButton: "Apoya a Vanguard en Ko-fi",
    giveNote: "Ko-fi gestiona el pago y muestra sus propias opciones. No se envía nada a Vanguard ni a este sitio.",
    otherTitle: "¿No puedes aportar? Esto también ayuda",
    other: `<ul>
  <li>Háblales de Vanguard a otros jugadores.</li>
  <li>Envía un informe de error o una idea en la <a href="/feedback/">página de Feedback</a>.</li>
  <li>Incluye las líneas de <code>/vg status</code> cuando algo falle, para que se pueda arreglar antes.</li>
</ul>`,
    follow: "Sigue a {x} en X para estar al día y habla con otros jugadores en {discord}.",
  },
};

// Spanish (Mexico): the Spain draft with Latin American quotes and words (curly
// quotes, "mouse", "Shift", "costo", "reporte"), as the site strings do.
const MEXICAN = [[/«/g, "“"], [/»/g, "”"], [/ratón/g, "mouse"], [/Mayús/g, "Shift"], [/coste/g, "costo"],
  [/<a href="\/feedback\/">informa<\/a> de lo que/g, `<a href="/feedback/">reporta</a> lo que`], [/Infórmalo/g, "Repórtalo"],
  [/que informan los jugadores/g, "que reportan los jugadores"], [/informe/g, "reporte"]];

// A page table with every text in Mexican Spanish.
function mexican(table) {
  if (typeof table === "string") return MEXICAN.reduce((t, [re, to]) => t.replace(re, to), table);
  return Object.fromEntries(Object.entries(table).map(([k, v]) => [k, mexican(v)]));
}

export const PAGES_ES_MX = mexican(PAGES_ES);

export const PAGES_IT = {
  help: {
    page: {
      description: "Soluzioni ai problemi comuni di Vanguard, con i comandi e i messaggi dell’addon stesso.",
      lede: "Ogni risposta usa i comandi di Vanguard e ne cita i messaggi reali. Apri una domanda per vedere la soluzione.",
      glanceStatus: "Inizia da <code>/vg status</code>: le sue righe dicono cosa è caricato",
      glanceReport: `Niente ti aiuta? <a href="/feedback/">Invia una segnalazione</a>`,
      questions: { one: "{n} domanda", other: "{n} domande", many: "{n} domande" },
      knownTitle: "Problemi noti",
      known: `<p>Finora non è stato confermato nessun problema noto. Vanguard è una versione iniziale: non tutto è stato ancora verificato nel gioco e alcune funzioni sono ancora in rifinitura, quindi se qualcosa non ti sembra a posto, diccelo nella <a href="/feedback/">pagina Feedback</a>.</p>
<div class="notice info"><p><strong>Non trovi il tuo caso?</strong> O la soluzione non ha aiutato? Segnalalo lì, e includi ogni riga di <code>/vg status</code>.</p></div>`,
      ask: "Problema risolto?",
      thanks: "Ringrazia su Ko-fi",
      quote: "“{text}”",
    },
    sections: { fixes: "Soluzioni rapide", forever: "WoW Forever, configurazione ed errori" },
    entries: {
      "frame-moved": { q: "Un riquadro è fuori dallo schermo o nel posto sbagliato",
        a: `<p><code>/vg frames</code> elenca i riquadri che puoi spostare. <code>/vg reset &lt;frame&gt;</code> ne riporta uno al suo posto predefinito, e <code>/vg reset all</code> (o <strong>{resetAll}</strong> in <strong>{ui:General} → {ui:Layout}</strong> dentro <code>/vg</code>) li riporta tutti.</p><p>Per posizionare i riquadri da solo, scrivi <code>/vg unlock</code> (“{unlockMsg}”), trascina le maniglie, poi scrivi <code>/vg lock</code>.</p>` },
      "look": { q: "Colori o caratteri sembrano sbagliati",
        a: `<p><code>/vg theme reset</code> ripristina il tema; la sua riga di aiuto dice: “{themeHelp}” (è anche il pulsante <strong>{resetTheme}</strong> in <strong>{ui:General} → {ui:Look}</strong>). <code>/vg accent reset</code> ripristina solo il colore d’accento.</p>` },
      "one-feature": { q: "Una parte di Vanguard non funziona bene",
        a: `<p>Scrivi <code>/vg modules</code> per vedere le parti (moduli), poi <code>/vg disable &lt;module&gt;</code> e <code>/reload</code>. Il README dice: “{keepDefault}” La pagina {ui:Modules} della finestra delle opzioni aggiunge: “{modOff}”</p><p><code>/vg enable &lt;module&gt;</code> e <code>/reload</code> la riportano. Per favore <a href="/feedback/">segnala</a> cosa è andato storto.</p>` },
      "errors": { q: "La chat mostra un errore di Vanguard",
        a: `<p>Un errore in una parte non ferma le altre: Vanguard lo conserva e <code>/vg errors</code> lo elenca. La riga di aiuto del comando dice: “{errorsHelp}”.</p><p>Disattiva quella parte (vedi sopra), poi invia una <a href="/feedback/">segnalazione</a> con dentro <code>/vg report</code>.</p>` },
      "report": { q: "Cosa metto in una segnalazione di bug?",
        a: `<p>Scrivi <code>/vg report</code>. La sua riga di aiuto dice: “{reportHelp}”. Si apre in un riquadro, già selezionato; il titolo del riquadro dice “{reportTitle}”. Incollalo per intero nel modulo <a href="/feedback/">Feedback</a>, con cosa hai fatto e cosa è successo.</p>` },
      "broken": { q: "Non funziona più niente",
        a: `<p><code>/vg profile reset</code> chiede prima (“{profResetAsk}”), tiene una copia del profilo che usi e lo riporta ai valori predefiniti (“{profReset}”); poi ricarica.</p><p>Per provare senza perdere le tue impostazioni, passa invece questo personaggio a un profilo nuovo e vuoto: <code>/vg profile Test</code>. Succede al prossimo ricaricamento: “{nextSwitch}” Vedi <a href="/profiles/">Profili</a>.</p>` },
      "import": { q: "L’importazione non è riuscita",
        a: `<p>Quando una stringa di importazione non si può usare, Vanguard dice “{importFailed}” e uno di questi motivi:</p>{reasons}<p>Quasi sempre la stringa è stata tagliata durante la copia o l’incolla: esportala di nuovo e copiala tutta.</p>` },
      "health-hidden": { q: "Alcuni numeri non compaiono nelle istanze",
        a: `<p>Il client del gioco nasconde alcuni valori agli addon, per esempio in combattimento nelle istanze. Il README dice di quei valori: “{unread}”. Le barre si riempiono comunque, ma Vanguard non può mostrare un numero che non ha il permesso di leggere. È previsto. <code>/vg status</code> dice “{auraHidden}” quando i valori delle aure sono nascosti.</p>` },
      "reload": { q: "Un’impostazione non ha cambiato niente",
        a: `<p>Le impostazioni contrassegnate con {RELOAD} nella pagina <a href="/settings/">Impostazioni</a> valgono dopo un ricaricamento: la finestra delle opzioni offre un pulsante <strong>{ui:Reload now}</strong>. I pulsanti di ricaricamento sono fatti nel modo che WoW Forever permette. Uno creato durante un combattimento funziona quando il combattimento finisce; fino ad allora dice “{typeReload}”</p>` },
      "combat": { q: "Qualcosa non cambia durante un combattimento",
        a: `<p>Alcune modifiche non si possono fare in combattimento. Vanguard le tiene da parte e le applica quando il combattimento finisce. La seconda riga di <code>/vg status</code> le conta: “&lt;n&gt; {waiting}”.</p>` },
      "renamed": { q: "Dov’è finito ForeverUI?",
        a: `<p>Ora si chiama Vanguard: è lo stesso addon, rinominato perché un altro addon, senza legami, è pubblicato come ForeverUI. I comandi sono <code>/vg</code> e <code>/vanguard</code> invece di <code>/fui</code>. Le tue impostazioni non passano da sole: prima di aggiornare, scrivi <code>/fui export</code> e conserva il testo; dopo l’aggiornamento, importalo con <code>/vg import</code>. Vedi <a href="/install/#renamed">Installazione e aggiornamento</a>.</p>` },
      "settings-lost": { q: "Le mie impostazioni si azzerano ogni volta che avvio il gioco",
        a: `<p>Il codice dell’addon nota che le build beta di WoW Forever precedenti alla {fixedBuild} perdono le impostazioni degli addon a ogni avvio, e rompono i riquadri dell’incursione, il lancio con clic e il cambio pagina delle barre. Aggiorna il gioco. Su una build precedente, <code>/vg status</code> dice: “{buildWarn}”.</p>` },
      "hover-keys": { q: "I tasti al passaggio del mouse non funzionano",
        a: `<p>Alcuni client beta di WoW Forever non possono eseguire il codice che serve ai tasti al passaggio del mouse. Vanguard allora lo dice all’accesso: “{snipChat}”, e <code>/vg status</code> mostra “{noSnip}”. La pagina {ui:Click casting} dice: “{ccNote}”</p><p>Il lancio con clic del mouse funziona ancora, la barra 1 cambia ancora con posture, forme e Maiusc+numero, e i riquadri dell’incursione funzionano ancora.</p>` },
      "setup": { q: "La procedura guidata di configurazione non si è aperta",
        a: `<p>La procedura guidata si apre la prima volta che accedi con un account. Se sei in combattimento aspetta: “{setupCombat}” Dopo averla finita o chiusa, riaprila con <code>/vg setup</code> o <strong>{ui:Run setup}</strong> in <strong>{ui:General} → {ui:Layout}</strong> dentro <code>/vg</code>.</p>` },
      "edit-mode": { q: "I riquadri di Vanguard non compaiono nella Modalità modifica",
        a: `<p>Quando apri la Modalità modifica del gioco, compaiono anche le maniglie di Vanguard, con una nota: “{editNote}” Se non compaiono, spunta <strong>{editOpt}</strong> in <strong>{ui:General} → {ui:Layout}</strong> dentro <code>/vg</code>.</p><p>I riquadri del gioco che Vanguard nasconde o sostituisce (le sue barre delle azioni, le barre di esperienza e reputazione, i riquadri delle unità e così via) di proposito non hanno una maniglia nella Modalità modifica. Sposta invece i riquadri di Vanguard.</p>` },
      "edit-layout": { q: "La chat dice che il mio profilo usa un layout della Modalità modifica che questo account non ha",
        a: `<p>Un profilo ricorda quale layout della Modalità modifica del gioco usi con esso. Quando un personaggio carica quel profilo, Vanguard porta la Modalità modifica sul layout con quel nome, se il tuo account ne ha uno. Altrimenti Vanguard dice “{editMissing}” e lascia la Modalità modifica com’è.</p>` },
      "errors-badge": { q: "C’è un numero rosso sul pulsante degli addon",
        a: `<p>È il numero di errori che Vanguard ha intercettato in questa sessione. Il piè di pagina della finestra delle opzioni dice lo stesso (“{footerLine}”). Fai clic su quella riga o scrivi <code>/vg errors</code> per elencarli; il pulsante <strong>{errorsReport}</strong> della lista apre il modulo di feedback di Vanguard su un bug con la lista allegata, oppure puoi incollarla qui in una <a href="/feedback/">segnalazione di bug</a>. Il suo pulsante <strong>{errorsClear}</strong> (o <code>/vg errors clear</code>) svuota la lista, e il numero sparisce. Se non è stato intercettato niente, <code>/vg errors</code> dice “{noErrors}”</p>` },
      "language": { q: "Vanguard è nella mia lingua?",
        a: `<p>Il testo di Vanguard (la finestra delle opzioni, la configurazione, le righe della chat e i tooltip) appare nella lingua del tuo client: tedesco, francese, spagnolo (Spagna e America Latina), italiano, portoghese brasiliano, russo, coreano e cinese (semplificato e tradizionale), e in inglese in tutti gli altri casi. I nomi forniti dal gioco (incantesimi, oggetti, zone) restano nella lingua del tuo client.</p><p>Le traduzioni sono nuove e fatte a macchina, quindi alcune righe suoneranno strane. Quando ne trovi una, diccelo nella <a href="/feedback/">pagina Feedback</a> (o con <code>/vg feedback</code> nel gioco): cita la riga, indica la tua lingua e, se puoi, come dovrebbe essere. I comandi che digiti restano in inglese.</p>` },
      "perf": { q: "Vanguard rallenta il mio gioco?",
        a: `<p><code>/vg perf</code> mostra il tempo di CPU e la memoria di Vanguard in questo momento, e le sue dieci funzioni più impegnate. Per misurare da solo il costo in CPU (il README: “{perfRecipe}”):</p><ol class="steps"><li>Scrivi <code>/vg perf cpu</code>, poi <code>/reload</code>.</li><li>Gioca per un po’ (un pull in incursione è il caso difficile).</li><li>Scrivi <code>/vg perf</code> e leggi i numeri.</li><li>Scrivi di nuovo <code>/vg perf cpu</code> e <code>/reload</code>. Misurare ha un costo; il README dice: “{perfSlows}”.</li></ol><p>Non sono ancora stati pubblicati dati sulle prestazioni.</p>` },
      "retail": { q: "Vanguard funziona su WoW Retail?",
        a: `<p>Vanguard è fatto per WoW Forever. Si carica anche su WoW Retail, ma Retail non è ancora supportato: le classi e i sistemi che esistono solo su Retail (come le Mitiche+, le incursioni e le case) non sono coperti, e alcune parti potrebbero non funzionare.</p><p>Il supporto completo per Retail è previsto per una versione successiva. Fino ad allora, se giochi su Retail e qualcosa non va, diccelo nella <a href="/feedback/">pagina Feedback</a> e scrivi che sei su Retail.</p>` },
    },
  },
  support: {
    description: "Vanguard è gratuito e lo crea una sola persona. Ecco cosa paga il sostegno, come darlo e altri modi per aiutare.",
    lede: "Vanguard è gratuito, e lo sarà sempre. Il sostegno è un grazie, mai un obbligo.",
    paysTitle: "Cosa paga il sostegno",
    pays: `<p>Vanguard lo crea una sola persona. Il sostegno paga il tempo per tenerlo funzionante mentre le patch di WoW Forever cambiano le cose, e per correggere ciò che i giocatori segnalano.</p>
<p>Non sblocca mai niente: ogni parte di Vanguard funziona allo stesso modo per tutti.</p>`,
    giveTitle: "Dona su Ko-fi",
    giveButton: "Sostieni Vanguard su Ko-fi",
    giveNote: "Ko-fi gestisce il pagamento e mostra le sue opzioni. Niente viene inviato a Vanguard o a questo sito.",
    otherTitle: "Non puoi contribuire? Anche questo aiuta",
    other: `<ul>
  <li>Parla di Vanguard ad altri giocatori.</li>
  <li>Invia una segnalazione di bug o un’idea nella <a href="/feedback/">pagina Feedback</a>.</li>
  <li>Includi le righe di <code>/vg status</code> quando qualcosa va storto, così si può correggere prima.</li>
</ul>`,
    follow: "Segui {x} su X per le novità, e parla con altri giocatori su {discord}.",
  },
};

export const PAGES_PT_BR = {
  help: {
    page: {
      description: "Soluções para problemas comuns do Vanguard, com os próprios comandos e mensagens do addon.",
      lede: "Cada resposta usa os comandos do Vanguard e cita as mensagens reais dele. Abra uma pergunta para ver a solução.",
      glanceStatus: "Comece por <code>/vg status</code>: as linhas dele dizem o que está carregado",
      glanceReport: `Nada ajudou? <a href="/feedback/">Envie um relatório</a>`,
      questions: { one: "{n} pergunta", other: "{n} perguntas", many: "{n} perguntas" },
      knownTitle: "Problemas conhecidos",
      known: `<p>Nenhum problema conhecido foi confirmado ainda. O Vanguard é uma versão inicial: nem tudo foi verificado no jogo ainda, e alguns recursos ainda estão sendo refinados, então, se algo parecer errado, conte para a gente na <a href="/feedback/">página de Feedback</a>.</p>
<div class="notice info"><p><strong>Não está aqui?</strong> Ou a solução não ajudou? Relate lá também e inclua todas as linhas de <code>/vg status</code>.</p></div>`,
      ask: "Problema resolvido?",
      thanks: "Agradeça no Ko-fi",
      quote: "“{text}”",
    },
    sections: { fixes: "Soluções rápidas", forever: "WoW Forever, configuração e erros" },
    entries: {
      "frame-moved": { q: "Um quadro está fora da tela ou no lugar errado",
        a: `<p><code>/vg frames</code> lista os quadros que você pode mover. <code>/vg reset &lt;frame&gt;</code> devolve um à posição padrão, e <code>/vg reset all</code> (ou <strong>{resetAll}</strong> em <strong>{ui:General} → {ui:Layout}</strong> no <code>/vg</code>) devolve todos.</p><p>Para posicionar os quadros você mesmo, digite <code>/vg unlock</code> (“{unlockMsg}”), arraste as alças e depois digite <code>/vg lock</code>.</p>` },
      "look": { q: "Cores ou fontes parecem erradas",
        a: `<p><code>/vg theme reset</code> restaura o tema; a linha de ajuda dele diz: “{themeHelp}” (também é o botão <strong>{resetTheme}</strong> em <strong>{ui:General} → {ui:Look}</strong>). <code>/vg accent reset</code> restaura só a cor de destaque.</p>` },
      "one-feature": { q: "Uma parte do Vanguard está com problema",
        a: `<p>Digite <code>/vg modules</code> para ver as partes (módulos), depois <code>/vg disable &lt;module&gt;</code> e <code>/reload</code>. O README diz: “{keepDefault}” A página {ui:Modules} da janela de opções acrescenta: “{modOff}”</p><p><code>/vg enable &lt;module&gt;</code> e <code>/reload</code> trazem a parte de volta. Por favor, <a href="/feedback/">relate</a> o que deu errado.</p>` },
      "errors": { q: "O chat mostra um erro do Vanguard",
        a: `<p>Um erro em uma parte não para as outras: o Vanguard guarda o erro, e <code>/vg errors</code> o lista. A linha de ajuda do comando diz: “{errorsHelp}”.</p><p>Desligue essa parte (veja acima) e depois envie um <a href="/feedback/">relatório</a> com o <code>/vg report</code> dentro.</p>` },
      "report": { q: "O que coloco num relatório de bug?",
        a: `<p>Digite <code>/vg report</code>. A linha de ajuda dele diz: “{reportHelp}”. Ele abre numa caixa, já selecionado; o título da caixa diz “{reportTitle}”. Cole tudo no formulário de <a href="/feedback/">Feedback</a>, com o que você fez e o que aconteceu.</p>` },
      "broken": { q: "Está tudo quebrado",
        a: `<p><code>/vg profile reset</code> pergunta antes (“{profResetAsk}”), guarda uma cópia do perfil que você usa e o volta ao padrão (“{profReset}”); depois recarregue.</p><p>Para testar sem perder suas configurações, troque este personagem para um perfil novo e vazio: <code>/vg profile Test</code>. A troca acontece na próxima recarga: “{nextSwitch}” Veja <a href="/profiles/">Perfis</a>.</p>` },
      "import": { q: "A importação falhou",
        a: `<p>Quando um texto de importação não pode ser usado, o Vanguard diz “{importFailed}” e um destes motivos:</p>{reasons}<p>Na maioria das vezes, o texto foi cortado ao copiar ou colar: exporte de novo e copie tudo.</p>` },
      "health-hidden": { q: "Alguns números não aparecem em instâncias",
        a: `<p>O cliente do jogo esconde alguns valores dos addons, por exemplo em combate dentro de instâncias. O README diz desses valores: “{unread}”. As barras continuam se enchendo, mas o Vanguard não pode mostrar um número que não tem permissão para ler. Isso é esperado. <code>/vg status</code> diz “{auraHidden}” quando os valores das auras estão ocultos.</p>` },
      "reload": { q: "Uma configuração não mudou nada",
        a: `<p>As configurações marcadas com {RELOAD} na página <a href="/settings/">Configurações</a> valem depois de recarregar: a janela de opções oferece um botão <strong>{ui:Reload now}</strong>. Os botões de recarregar são feitos do jeito que o WoW Forever permite. Um criado durante um combate funciona quando o combate termina; até lá, ele diz “{typeReload}”</p>` },
      "combat": { q: "Algo não muda durante um combate",
        a: `<p>Algumas mudanças não podem ser feitas em combate. O Vanguard as guarda e as aplica quando o combate termina. A segunda linha de <code>/vg status</code> conta quantas são: “&lt;n&gt; {waiting}”.</p>` },
      "renamed": { q: "Cadê o ForeverUI?",
        a: `<p>Agora é Vanguard: o mesmo addon, renomeado porque outro addon, sem relação, é publicado como ForeverUI. Os comandos são <code>/vg</code> e <code>/vanguard</code> em vez de <code>/fui</code>. Suas configurações não passam sozinhas: antes de atualizar, digite <code>/fui export</code> e guarde o texto; depois de atualizar, importe com <code>/vg import</code>. Veja <a href="/install/#renamed">Instalar e atualizar</a>.</p>` },
      "settings-lost": { q: "Minhas configurações voltam ao padrão toda vez que inicio o jogo",
        a: `<p>O código do addon registra que builds beta do WoW Forever anteriores à {fixedBuild} perdem as configurações dos addons a cada início e quebram os quadros de raide, o lançamento por clique e a troca de página das barras. Atualize o jogo. Numa build mais antiga, <code>/vg status</code> diz: “{buildWarn}”.</p>` },
      "hover-keys": { q: "As teclas ao passar o mouse não funcionam",
        a: `<p>Alguns clientes beta do WoW Forever não conseguem rodar o código de que as teclas ao passar o mouse precisam. O Vanguard então avisa ao entrar: “{snipChat}”, e <code>/vg status</code> mostra “{noSnip}”. A página {ui:Click casting} diz: “{ccNote}”</p><p>O lançamento por clique do mouse continua funcionando, a barra 1 continua mudando com posturas, formas e Shift+número, e os quadros de raide continuam funcionando.</p>` },
      "setup": { q: "O assistente de configuração não abriu",
        a: `<p>O assistente de configuração abre na primeira vez que você entra numa conta. Se você estiver em combate, ele espera: “{setupCombat}” Depois de terminar ou fechar, abra de novo com <code>/vg setup</code> ou <strong>{ui:Run setup}</strong> em <strong>{ui:General} → {ui:Layout}</strong> no <code>/vg</code>.</p>` },
      "edit-mode": { q: "Os quadros do Vanguard não aparecem no Modo de Edição",
        a: `<p>Quando você abre o Modo de Edição do jogo, as alças do Vanguard também aparecem, com uma nota: “{editNote}” Se não aparecerem, marque <strong>{editOpt}</strong> em <strong>{ui:General} → {ui:Layout}</strong> no <code>/vg</code>.</p><p>Os quadros do jogo que o Vanguard esconde ou substitui (as barras de ação, as barras de experiência e reputação, os quadros de unidade e assim por diante) não ganham alça no Modo de Edição de propósito. Mova os quadros do Vanguard em vez disso.</p>` },
      "edit-layout": { q: "O chat diz que meu perfil usa um layout do Modo de Edição que esta conta não tem",
        a: `<p>Um perfil lembra qual layout do Modo de Edição do jogo você usa com ele. Quando um personagem carrega esse perfil, o Vanguard muda o Modo de Edição para o layout com esse nome, se a sua conta tiver um. Se não tiver, o Vanguard diz “{editMissing}” e deixa o Modo de Edição como está.</p>` },
      "errors-badge": { q: "Tem um número vermelho no botão de addons",
        a: `<p>É quantos erros o Vanguard capturou nesta sessão. O rodapé da janela de opções diz o mesmo (“{footerLine}”). Clique nessa linha ou digite <code>/vg errors</code> para listar os erros; o botão <strong>{errorsReport}</strong> da lista abre o formulário de feedback do Vanguard sobre um bug com a lista anexada, ou você pode colar a lista aqui num <a href="/feedback/">relatório de bug</a>. O botão <strong>{errorsClear}</strong> dela (ou <code>/vg errors clear</code>) esvazia a lista, e o número some. Sem nada capturado, <code>/vg errors</code> diz “{noErrors}”</p>` },
      "language": { q: "O Vanguard está no meu idioma?",
        a: `<p>O texto do próprio Vanguard (a janela de opções, a configuração, as linhas do chat e as dicas) aparece no idioma do seu cliente: alemão, francês, espanhol (Espanha e América Latina), italiano, português do Brasil, russo, coreano e chinês (simplificado e tradicional), e em inglês em todos os outros. Os nomes que o jogo fornece (feitiços, itens, zonas) continuam no idioma do seu cliente.</p><p>As traduções são novas e feitas por máquina, então algumas linhas vão soar estranhas. Quando encontrar uma, conte para a gente na <a href="/feedback/">página de Feedback</a> (ou com <code>/vg feedback</code> no jogo): cite a linha, diga o seu idioma e, se puder, como ela deveria ficar. Os comandos que você digita continuam em inglês.</p>` },
      "perf": { q: "O Vanguard está deixando meu jogo lento?",
        a: `<p><code>/vg perf</code> mostra o tempo de CPU e a memória do Vanguard agora, e as dez funções mais ocupadas dele. Para medir você mesmo o custo de CPU (o README: “{perfRecipe}”):</p><ol class="steps"><li>Digite <code>/vg perf cpu</code> e depois <code>/reload</code>.</li><li>Jogue um pouco (um pull de raide é o caso difícil).</li><li>Digite <code>/vg perf</code> e leia os números.</li><li>Digite <code>/vg perf cpu</code> e <code>/reload</code> de novo. Medir tem um custo; o README diz: “{perfSlows}”.</li></ol><p>Ainda não há números de desempenho publicados.</p>` },
      "retail": { q: "O Vanguard funciona no WoW Retail?",
        a: `<p>O Vanguard é feito para o WoW Forever. Ele também carrega no WoW Retail, mas o Retail ainda não tem suporte: as classes e os sistemas que só existem no Retail (como Mítica+, Imersões e moradias) não estão cobertos, e algumas partes podem não funcionar.</p><p>O suporte completo ao Retail está planejado para uma versão futura. Até lá, se você joga no Retail e algo der errado, conte para nós na <a href="/feedback/">página de feedback</a> e diga que está no Retail.</p>` },
    },
  },
  support: {
    description: "O Vanguard é gratuito e feito por uma pessoa só. Veja o que o apoio paga, como dar e outras formas de ajudar.",
    lede: "O Vanguard é gratuito, e sempre vai ser. Apoio é um agradecimento, nunca uma obrigação.",
    paysTitle: "O que o apoio paga",
    pays: `<p>O Vanguard é feito por uma pessoa só. O apoio paga o tempo para mantê-lo funcionando conforme os patches do WoW Forever mudam as coisas, e para corrigir o que os jogadores relatam.</p>
<p>Ele nunca desbloqueia nada: cada parte do Vanguard funciona igual para todo mundo.</p>`,
    giveTitle: "Contribua no Ko-fi",
    giveButton: "Apoie o Vanguard no Ko-fi",
    giveNote: "O Ko-fi cuida do pagamento e mostra as próprias opções. Nada é enviado ao Vanguard nem a este site.",
    otherTitle: "Não pode contribuir? Isto também ajuda",
    other: `<ul>
  <li>Conte sobre o Vanguard para outros jogadores.</li>
  <li>Envie um relatório de bug ou uma ideia na <a href="/feedback/">página de Feedback</a>.</li>
  <li>Inclua as linhas de <code>/vg status</code> quando algo der errado, para que seja corrigido mais rápido.</li>
</ul>`,
    follow: "Siga {x} no X para novidades e converse com outros jogadores no {discord}.",
  },
};
