/* Landing-page translations. User and bot names remain unchanged. */
(() => {
  const keys = ['Home','Dashboard','Extra','Status','About','Documentation','Support','Premium','Log in','Security for your server.','Built with precision.','Soezy keeps your Discord community safer with Anti-Nuke, AutoMod, verification, and moderation tools managed from one place.','Add to Discord','Open dashboard','Active servers','Protected users','Commands','System overview','Live statistics','Current service information from Soezy.','Checking','Global users','Available commands','API latency','System uptime','Total shards','Total clusters','Checking live status','Global systems online','Connection unavailable','Live','Unavailable'];
  const translations = {
    HI: ['होम','डैशबोर्ड','अन्य','स्थिति','परिचय','दस्तावेज़','सहायता','प्रीमियम','लॉग इन','आपके सर्वर की सुरक्षा।','सटीकता के साथ निर्मित।','Soezy आपके Discord समुदाय को एंटी-न्यूक, ऑटोमॉड, सत्यापन और मॉडरेशन टूल से सुरक्षित रखता है—सब कुछ एक ही जगह से प्रबंधित करें।','Discord में जोड़ें','डैशबोर्ड खोलें','सक्रिय सर्वर','सुरक्षित उपयोगकर्ता','कमांड','सिस्टम अवलोकन','लाइव आँकड़े','Soezy की वर्तमान सेवा जानकारी।','जाँच जारी है','कुल उपयोगकर्ता','उपलब्ध कमांड','API विलंब','सिस्टम अपटाइम','कुल शार्ड','कुल क्लस्टर','लाइव स्थिति की जाँच','सभी सिस्टम ऑनलाइन','कनेक्शन उपलब्ध नहीं','लाइव','अनुपलब्ध'],
    DE: ['Startseite','Dashboard','Mehr','Status','Über uns','Dokumentation','Support','Premium','Anmelden','Sicherheit für deinen Server.','Mit Präzision entwickelt.','Soezy schützt deine Discord-Community mit Anti-Nuke, AutoMod, Verifizierung und Moderation – zentral verwaltet.','Zu Discord hinzufügen','Dashboard öffnen','Aktive Server','Geschützte Nutzer','Befehle','Systemübersicht','Live-Statistiken','Aktuelle Serviceinformationen von Soezy.','Wird geprüft','Nutzer weltweit','Verfügbare Befehle','API-Latenz','Systemlaufzeit','Shards insgesamt','Cluster insgesamt','Live-Status wird geprüft','Alle Systeme online','Verbindung nicht verfügbar','Live','Nicht verfügbar'],
    ES: ['Inicio','Panel','Más','Estado','Acerca de','Documentación','Soporte','Premium','Iniciar sesión','Seguridad para tu servidor.','Diseñado con precisión.','Soezy protege tu comunidad de Discord con Anti-Nuke, AutoMod, verificación y moderación, todo desde un solo lugar.','Añadir a Discord','Abrir panel','Servidores activos','Usuarios protegidos','Comandos','Resumen del sistema','Estadísticas en vivo','Información actual del servicio de Soezy.','Comprobando','Usuarios globales','Comandos disponibles','Latencia de API','Tiempo de actividad','Shards totales','Clústeres totales','Comprobando estado en vivo','Todos los sistemas en línea','Conexión no disponible','En vivo','No disponible'],
    FR: ['Accueil','Tableau de bord','Plus','État','À propos','Documentation','Assistance','Premium','Connexion','La sécurité de votre serveur.','Conçu avec précision.','Soezy protège votre communauté Discord avec Anti-Nuke, AutoMod, vérification et modération, depuis un seul endroit.','Ajouter à Discord','Ouvrir le tableau de bord','Serveurs actifs','Utilisateurs protégés','Commandes','Vue du système','Statistiques en direct','Informations actuelles du service Soezy.','Vérification','Utilisateurs globaux','Commandes disponibles','Latence API','Durée de fonctionnement','Total des shards','Total des clusters','Vérification du statut','Tous les systèmes en ligne','Connexion indisponible','En direct','Indisponible'],
    PT: ['Início','Painel','Mais','Status','Sobre','Documentação','Suporte','Premium','Entrar','Segurança para seu servidor.','Feito com precisão.','Soezy protege sua comunidade do Discord com Anti-Nuke, AutoMod, verificação e moderação, tudo em um só lugar.','Adicionar ao Discord','Abrir painel','Servidores ativos','Usuários protegidos','Comandos','Visão geral do sistema','Estatísticas ao vivo','Informações atuais do serviço Soezy.','Verificando','Usuários globais','Comandos disponíveis','Latência da API','Tempo de atividade','Total de shards','Total de clusters','Verificando status ao vivo','Todos os sistemas online','Conexão indisponível','Ao vivo','Indisponível'],
    IT: ['Home','Pannello','Altro','Stato','Informazioni','Documentazione','Assistenza','Premium','Accedi','Sicurezza per il tuo server.','Creato con precisione.','Soezy protegge la tua comunità Discord con Anti-Nuke, AutoMod, verifica e moderazione, tutto da un unico posto.','Aggiungi a Discord','Apri pannello','Server attivi','Utenti protetti','Comandi','Panoramica del sistema','Statistiche in tempo reale','Informazioni attuali sul servizio Soezy.','Verifica in corso','Utenti globali','Comandi disponibili','Latenza API','Tempo di attività','Shard totali','Cluster totali','Verifica dello stato','Tutti i sistemi online','Connessione non disponibile','In diretta','Non disponibile']
  };
  let language = 'EN';
  const bindings = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script,style,[data-lang-option],[data-current-language],[data-current-flag],.hero-description')) continue;
    const key = node.textContent.trim();
    if (keys.includes(key)) bindings.push({node,key,prefix:node.textContent.match(/^\s*/)[0],suffix:node.textContent.match(/\s*$/)[0]});
  }
  const t = key => translations[language]?.[keys.indexOf(key)] || key;
  function apply(code) {
    language = code === 'EN' || translations[code] ? code : 'EN';
    document.documentElement.lang = language.toLowerCase();
    bindings.forEach(({node,key,prefix,suffix}) => { node.textContent = prefix+t(key)+suffix; });
    const description = document.querySelector('.hero-description');
    if (description) description.textContent = t(keys[11]);
    document.querySelectorAll('[data-lang-option]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.langOption === language));
    });
    // Runtime labels may have replaced their original text nodes.
    document.querySelectorAll('[data-status-label],[data-status-pill-label],[data-account-link]').forEach(el => {
      const key = el.dataset.translationKey;
      if (key) el.textContent = t(key);
    });
  }
  window.SOEZY_I18N = {t,apply};
})();
