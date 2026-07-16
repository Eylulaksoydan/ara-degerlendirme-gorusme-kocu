const state = {
  role: null,
  lastResult: null,
  variantIndex: 0
};

const roleScreen = document.getElementById("roleScreen");
const workspace = document.getElementById("workspace");
const roleBadgeText = document.getElementById("roleBadgeText");
const roleBadgeIcon = document.getElementById("roleBadgeIcon");
const workspaceTitle = document.getElementById("workspaceTitle");
const inputLabel = document.getElementById("inputLabel");
const userInput = document.getElementById("userInput");
const charCount = document.getElementById("charCount");
const scenarioList = document.getElementById("scenarioList");
const generateButton = document.getElementById("generateButton");
const clearButton = document.getElementById("clearButton");
const changeRoleButton = document.getElementById("changeRoleButton");
const emptyState = document.getElementById("emptyState");
const resultArea = document.getElementById("resultArea");
const responseCards = document.getElementById("responseCards");
const resultTitle = document.getElementById("resultTitle");
const copyAllButton = document.getElementById("copyAllButton");
const guideDialog = document.getElementById("guideDialog");
const guideButton = document.getElementById("guideButton");
const closeGuideButton = document.getElementById("closeGuideButton");
const toast = document.getElementById("toast");

const scenarios = {
  manager: [
    "Çalışanım hedefinin gerisinde ancak çok emek verdiğini düşünüyor.",
    "Çalışanım geri bildirim aldığında hemen savunmaya geçiyor.",
    "Çalışanım gecikmenin sorumluluğunu başka ekiplere yönlendiriyor.",
    "Çalışanımın güçlü yönünü takdir etmek istiyorum.",
    "Yetkinlik gelişimini konuşmak istiyorum.",
    "İletişim tarzının ekip üzerindeki etkisini konuşmak istiyorum.",
    "Bu cümleyi düzelt: Sürekli bahane üretiyorsun.",
    "Yılın kalan dönemi için net aksiyon belirlemek istiyorum."
  ],
  employee: [
    "Yöneticimin verdiği geri bildirime katılmadığım noktalar var.",
    "Hedef gecikmesini başka ekipleri suçlamadan açıklamak istiyorum.",
    "Yaptığım çalışmaların yeterince görünür olmadığını düşünüyorum.",
    "Yöneticim yeterince inisiyatif almadığımı söyledi.",
    "İş yükümü ve önceliklerimi konuşmak istiyorum.",
    "Yöneticimden destek istemek istiyorum.",
    "Gelişim beklentimi paylaşmak istiyorum.",
    "Bu cümleyi düzelt: Bu değerlendirme bana haksızlık."
  ]
};

const phraseBank = {
  manager: {
    openings: [
      "Ara değerlendirme kapsamında hedeflerin mevcut durumunu ve yılın kalan dönemindeki öncelikleri birlikte değerlendirmek istiyorum.",
      "Bugünkü görüşmede hem gerçekleşen ilerlemeyi hem de kalan dönemde netleştirmemiz gereken konuları ele alalım.",
      "Dönem başında belirlediğimiz hedeflere göre mevcut durumu birlikte gözden geçirmek istiyorum."
    ],
    closings: [
      "Bu başlık için sorumlulukları, ilk adımı ve takip tarihini birlikte netleştirelim.",
      "Kalan dönem için üzerinde anlaştığımız aksiyonları yazılı hale getirip belirlediğimiz tarihte tekrar değerlendirelim.",
      "İlerlemeyi düzenli izleyebilmek için bir sonraki kontrol tarihini ve beklenen çıktıyı netleştirelim."
    ]
  },
  employee: {
    openings: [
      "Paylaştığınız değerlendirmeyi doğru anlamak ve kendi görüşümü somut örneklerle aktarmak istiyorum.",
      "Geri bildiriminizdeki beklentileri netleştirmek ve kalan dönem için nasıl ilerleyeceğimizi konuşmak isterim.",
      "Değerlendirmenizi not aldım. Katıldığım ve farklı değerlendirdiğim noktaları somut örneklerle paylaşmak istiyorum."
    ],
    closings: [
      "Bu beklentiyi karşılamak için atacağım adımları ve ihtiyaç duyduğum desteği netleştirebilir miyiz?",
      "Kalan dönem için önceliklerimi bu doğrultuda güncelleyip belirlediğimiz tarihte ilerlemeyi paylaşabilirim.",
      "Üzerinde anlaştığımız aksiyonları ve takip tarihini netleştirerek ilerleyelim."
    ]
  }
};

function normalize(text) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[ç]/g, "c")
    .replace(/[ğ]/g, "g")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ş]/g, "s")
    .replace(/[ü]/g, "u");
}

function includesAny(text, words) {
  return words.some(word => text.includes(word));
}

function pick(items, offset = 0) {
  return items[(state.variantIndex + offset) % items.length];
}

function classify(text) {
  const n = normalize(text);

  if (includesAny(n, ["cumleyi duzelt", "nasil soyle", "yerine ne", "bu cumle", "ifade et"])) return "rewrite";
  if (includesAny(n, ["katilmiyorum", "itiraz", "haksiz", "farkli gorus", "degerlendirmesine katil"])) return "disagreement";
  if (includesAny(n, ["inisiyatif"])) return "initiative";
  if (includesAny(n, ["gorunur", "fark edilm", "iyi yaptiklarim", "katkilarim", "basarilarim"])) return "visibility";
  if (includesAny(n, ["gecik", "gerisinde", "hedef", "tamamlanmadi"])) return "goalDelay";
  if (includesAny(n, ["savunma", "sert", "ses tonu", "soz kes", "iletisim", "agresif"])) return "communication";
  if (includesAny(n, ["is yuku", "oncelik", "yogunluk"])) return "workload";
  if (includesAny(n, ["destek", "yardim", "kaynak"])) return "support";
  if (includesAny(n, ["guclu yon", "takdir", "basarili", "olumlu"])) return "recognition";
  if (includesAny(n, ["yetkinlik", "teknik uzmanlik", "gelisim"])) return "development";
  if (includesAny(n, ["aksiyon", "kalan donem", "takip"])) return "actionPlan";
  return "general";
}

function extractQuotedInput(text) {
  const colonIndex = text.indexOf(":");
  if (colonIndex >= 0 && colonIndex < text.length - 1) {
    return text.slice(colonIndex + 1).trim().replace(/^["“”']|["“”']$/g, "");
  }
  return "";
}

function createResponse(role, category, originalText, mode = "standard") {
  const opening = pick(phraseBank[role].openings);
  const closing = pick(phraseBank[role].closings, 1);
  const raw = extractQuotedInput(originalText);

  const commonAvoid = [
    "Her zaman / hiçbir zaman gibi genellemeler",
    "Kişilik veya niyet hakkında kesin yargılar",
    "Başka kişi ya da ekipleri doğrudan suçlayan ifadeler"
  ];

  const responses = {
    manager: {
      goalDelay: {
        title: "Hedef ilerlemesini net ve dengeli biçimde ele alın",
        assessment: "Çabayı teslim sonucundan ayırarak konuşun. Emeği görünür kılarken mevcut ilerleme düzeyini ve kalan dönem beklentisini belirsiz bırakmayın.",
        main: `${opening} “Bu hedef için gösterdiğiniz çabayı görüyorum. Bununla birlikte, mevcut sonuç planladığımız ilerleme düzeyinin gerisinde. İlerlemeyi zorlaştıran konuları, kontrolünüzde olan alanları ve ihtiyaç duyduğunuz desteği birlikte netleştirelim.”`,
        alternative: "“Hedefte beklediğimiz noktaya henüz ulaşamadık. Nelerin gecikmeye neden olduğunu sizden dinlemek ve kalan dönem için daha uygulanabilir bir plan oluşturmak istiyorum.”",
        reaction: "Çalışan: “Elimden geleni yaptım; gecikmenin tamamı benimle ilgili değil.”",
        continuation: "“Gösterdiğiniz çabayı ve süreçteki bağımlılıkları ayrı ayrı değerlendirelim. Öncelikle sizin kontrolünüzde olan adımları, ardından başka ekiplerden beklenen katkıları netleştirelim.”",
        close: closing,
        avoid: [...commonAvoid, "“Çok çalışmış olabilirsiniz ama sonuç yok.”", "“Yine hedefinizi tamamlayamadınız.”"]
      },
      communication: {
        title: "Kişiliğe değil gözlemlenen davranışa odaklanın",
        assessment: "“Sert”, “zor” veya “savunmacı” gibi etiketler yerine, görüşmede ortaya çıkan davranışı ve iş üzerindeki etkisini açıklayın.",
        main: `${opening} “Son görüşmelerde geri bildirim paylaşıldığında açıklamalar tamamlanmadan karşılık verildiğini gözlemledim. Bu durum konuyu bütün yönleriyle değerlendirmemizi zorlaştırıyor. Önce geri bildirimi ve dayandığı örnekleri tamamlayalım; ardından sizin değerlendirmenizi ayrıntılı biçimde ele alalım.”`,
        alternative: "“Farklı görüşlerinizi paylaşmanız önemli. Bununla birlikte, görüşmenin verimli ilerleyebilmesi için önce somut örnekleri tamamlamamıza, ardından sizin bakış açınızı değerlendirmemize ihtiyaç var.”",
        reaction: "Çalışan: “Ben sadece kendi görüşümü açıklıyorum.”",
        continuation: "“Görüşünüzü paylaşmanızı bekliyorum. Buradaki konu, görüşün paylaşılması değil; karşılıklı olarak açıklamaları tamamlamaya alan açılması.”",
        close: closing,
        avoid: [...commonAvoid, "“Geri bildirime açık değilsiniz.”", "“Sizinle konuşmak mümkün değil.”"]
      },
      recognition: {
        title: "Takdiri davranış ve sonuçla ilişkilendirin",
        assessment: "Genel övgü yerine, hangi katkının hangi sonucu oluşturduğunu somutlaştırın.",
        main: `${opening} “Özellikle X çalışmasında sorumluluğu zamanında üstlenmeniz ve ilgili ekipleri ortak bir plan etrafında toplamanız sürecin planlanan tarihte ilerlemesine katkı sağladı. Bu yaklaşımınızı güçlü bir yönünüz olarak değerlendiriyorum.”`,
        alternative: "“Dönem içinde öne çıkan katkılarınızdan biri, X konusundaki takip disiplininiz oldu. Bu yaklaşım hem iş birliğini hem de sonuç kalitesini güçlendirdi.”",
        reaction: "Çalışan: “Teşekkür ederim. Bu yaklaşımı farklı projelerde de sürdürmek istiyorum.”",
        continuation: "“Bunu desteklemek için benzer sorumluluk alabileceğiniz alanları ve gelişim fırsatlarını birlikte belirleyebiliriz.”",
        close: closing,
        avoid: ["“Harika çalışıyorsunuz.” gibi genel ifadeler", "Sonuçla ilişkilendirilmeyen övgüler", "Diğer çalışanlarla kıyaslama"]
      },
      development: {
        title: "Gelişim alanını somut beklentiye dönüştürün",
        assessment: "Yetkinlik veya teknik uzmanlık değerlendirmesini genel ifadelerle bırakmayın; beklenen davranışı ve uygulama alanını açıklayın.",
        main: `${opening} “X yetkinliğinde güçlü bir temeliniz bulunuyor. Kalan dönemde bu yetkinliği daha ileri taşımak için özellikle Y davranışının daha düzenli görünür olmasını bekliyorum. Bunu hangi görev veya projede uygulayabileceğimizi birlikte belirleyelim.”`,
        alternative: "“Teknik bilginizin güçlü olduğunu görüyorum. Bir sonraki gelişim adımı, bu bilgiyi karar alma ve ekip yönlendirme süreçlerinde daha sistematik kullanmak olabilir.”",
        reaction: "Çalışan: “Bu beklentiyi hangi örnek üzerinden değerlendiriyorsunuz?”",
        continuation: "“X çalışmasında teknik çözüm güçlüydü; ancak gerekçenin paydaşlara aktarılması ve kararın sahiplenilmesi daha görünür olabilirdi.”",
        close: closing,
        avoid: [...commonAvoid, "“Bu yetkinlik sizde zayıf.”", "Somut örnek vermeden puan veya seviye belirtmek"]
      },
      actionPlan: {
        title: "Görüşmeyi ölçülebilir aksiyonlarla kapatın",
        assessment: "Aksiyonları yalnızca niyet düzeyinde bırakmayın. Sorumlu kişi, beklenen çıktı ve takip tarihi belirleyin.",
        main: `${opening} “Kalan dönem için üç başlığı netleştirelim: tamamlanacak çıktı, ilk aksiyon ve takip tarihi. Her aksiyon için sorumluluğu ve ihtiyaç duyulan desteği de yazılı hale getirelim.”`,
        alternative: "“Görüşmeden somut bir planla ayrılmak için öncelikleri, başarı göstergesini ve kontrol tarihini birlikte belirleyelim.”",
        reaction: "Çalışan: “Takip sıklığının fazla olacağını düşünüyorum.”",
        continuation: "“Takibin amacı ayrıntılı kontrol değil, riski erken görünür hale getirmek. Sıklığı işin ihtiyacına göre birlikte belirleyebiliriz.”",
        close: closing,
        avoid: ["“Daha dikkatli olmalısınız.” gibi ölçülemeyen aksiyonlar", "Takip tarihi belirlememek", "Tüm sorumluluğu tek tarafa bırakmak"]
      },
      rewrite: {
        title: "Cümleyi davranış ve beklenti üzerinden yeniden kurun",
        assessment: raw
          ? `“${raw}” ifadesi genelleme veya niyet atfı içeriyorsa karşı tarafın savunmaya geçmesine neden olabilir.`
          : "İfadeyi kişilik veya niyet değerlendirmesi yerine somut durum, etki ve beklenti üzerinden kurun.",
        main: raw && normalize(raw).includes("bahane")
          ? "“Son değerlendirmelerde gecikmelere ilişkin farklı engeller paylaşıldı. Bu engelleri daha erken görünür hale getirmek ve gerekli desteği zamanında planlamak için nasıl bir takip yöntemi oluşturabiliriz?”"
          : "“Bu konuyla ilgili somut örnekleri ve iş sonucuna etkisini birlikte değerlendirelim. Kalan dönem için beklenen yaklaşımı da netleştirmek istiyorum.”",
        alternative: "“Yaşanan durumu kişisel bir değerlendirmeye dönüştürmeden, hangi davranışın değişmesini beklediğimizi ve bunun iş sonucuna etkisini açıkça konuşalım.”",
        reaction: "Çalışan: “Bu değerlendirmeye katılmıyorum.”",
        continuation: "“Farklı görüşünüzü somut örneklerle ele alabiliriz. Önce benim değerlendirmemin dayandığı örneği, ardından sizin bakış açınızı inceleyelim.”",
        close: closing,
        avoid: [...commonAvoid, raw ? `“${raw}” ifadesini doğrudan kullanmak` : "Etiketleyici ifadeler"]
      },
      general: {
        title: "Konuyu somut örnek, etki ve beklenti üzerinden yapılandırın",
        assessment: "Görüşmeye başlamadan önce hangi olayın ele alınacağını, iş üzerindeki etkisini ve kalan dönem beklentisini netleştirin.",
        main: `${opening} “Ele almak istediğim konu X durumunda gözlemlediğim Y davranışı. Bunun iş sonucuna etkisi Z oldu. Sizin değerlendirmenizi de aldıktan sonra, kalan dönem için nasıl ilerleyeceğimizi netleştirelim.”`,
        alternative: "“Bu konuyu kişisel bir değerlendirme olarak değil, iş sonucu ve gelişim beklentisi üzerinden ele almak istiyorum.”",
        reaction: "Çalışan: “Bu değerlendirmeyi hangi örneğe dayanarak yapıyorsunuz?”",
        continuation: "“Değerlendirmem X tarihindeki Y durumu ve ortaya çıkan Z sonucuna dayanıyor. Sizin bakış açınızı da bu örnek üzerinden değerlendirebiliriz.”",
        close: closing,
        avoid: commonAvoid
      }
    },
    employee: {
      disagreement: {
        title: "Farklı görüşünüzü somut örneklerle ifade edin",
        assessment: "Geri bildirimi doğrudan reddetmek yerine, değerlendirmenin dayandığı örnekleri sorun ve kendi görüşünüzü ölçülebilir sonuçlarla açıklayın.",
        main: `${opening} “Değerlendirmenin bazı bölümlerine ilişkin farklı bir görüşüm bulunuyor. Bu değerlendirmenize dayanak oluşturan somut örnekleri birlikte inceleyebilir miyiz? Ardından kendi değerlendirmemi ve ilgili sonuçları paylaşmak isterim.”`,
        alternative: "“Gelişim alanlarına ilişkin beklentiyi anlıyorum. Bununla birlikte, değerlendirmenin tüm dönem performansımı yansıtmadığını düşünüyorum. X ve Y çalışmalarındaki sonuçların da değerlendirmeye dahil edilmesini isterim.”",
        reaction: "Yönetici: “Bu değerlendirme yalnızca benim görüşüm değil.”",
        continuation: "“Değerlendirmenin kapsamını ve kullanılan örnekleri anlamak isterim. Böylece hangi davranışları değiştirmem gerektiğini daha net planlayabilirim.”",
        close: closing,
        avoid: [...commonAvoid, "“Bu değerlendirme haksız.”", "“Beni yanlış değerlendiriyorsunuz.”"]
      },
      initiative: {
        title: "Beklentiyi somutlaştırın ve sorumluluk alanını netleştirin",
        assessment: "“İnisiyatif” geniş bir kavramdır. Hangi durumlarda daha bağımsız hareket etmeniz beklendiğini somutlaştırın.",
        main: `${opening} “Daha fazla inisiyatif almamı beklediğiniz belirli bir durum veya örnek paylaşabilir misiniz? Beklentiyi somutlaştırabilirsek, hangi kararları daha bağımsız almam ve hangi aşamada bilgi vermem gerektiğini daha net planlayabilirim.”`,
        alternative: "“Bazı konularda daha proaktif davranabileceğimi kabul ediyorum. Bununla birlikte, karar sınırlarının net olmadığı durumlar oldu. Kalan dönemde hangi alanlarda daha bağımsız hareket etmemi beklediğinizi netleştirebilir miyiz?”",
        reaction: "Yönetici: “Her konuda yönlendirme bekliyorsunuz.”",
        continuation: "“Bu değerlendirmenin dayandığı iki veya üç örneği ele alırsak, hangi noktada farklı davranmam gerektiğini daha somut görebilirim.”",
        close: closing,
        avoid: [...commonAvoid, "“Yetkim olmadığı için hiçbir şey yapamadım.”", "“Ne yapacağım bana söylenmedi.”"]
      },
      visibility: {
        title: "Katkılarınızı sonuç ve etki üzerinden görünür kılın",
        assessment: "“Çalışmalarım görülmüyor” demek yerine, hangi katkının hangi sonucu oluşturduğunu açıklayın ve yöneticinizin değerlendirmesini sorun.",
        main: `${opening} “Gelişim alanlarının yanında dönem içinde gerçekleştirdiğim çalışmaların ve elde ettiğim sonuçların da değerlendirmeye dahil edilmesini isterim. Özellikle X çalışmasındaki katkımın ve ortaya çıkan sonucun nasıl değerlendirildiğini öğrenmek istiyorum.”`,
        alternative: "“Bu dönem X, Y ve Z başlıklarında sorumluluk aldım. Bu çalışmaların hedefler ve ekip çıktıları üzerindeki etkisini birlikte değerlendirebilir miyiz?”",
        reaction: "Yönetici: “Bunlar zaten görevinizin bir parçası.”",
        continuation: "“Görev kapsamım içinde olduğunu kabul ediyorum. Bununla birlikte, ortaya çıkan sonuçların performans değerlendirmesine nasıl yansıdığını netleştirmek istiyorum.”",
        close: closing,
        avoid: [...commonAvoid, "“İyi yaptığım hiçbir şey konuşulmadı.”", "“Emeklerim görülmüyor.”"]
      },
      goalDelay: {
        title: "Gecikmeyi açıklarken sorumluluk ve bağımlılıkları birlikte ele alın",
        assessment: "Gecikmeyi tamamen dış faktörlere bağlamayın. Süreci etkileyen bağımlılığı, kendi sorumluluğunuzu ve düzeltici aksiyonu birlikte ifade edin.",
        main: `${opening} “Hedefte planlanan ilerlemenin gerisinde kaldığımızı kabul ediyorum. Süreci etkileyen temel konu X bağımlılığı oldu. Bununla birlikte, riski daha erken görünür hale getirmem mümkün olabilirdi. Kalan dönemde takip sıklığını artırmayı ve kritik bağımlılıkları önceden paylaşmayı planlıyorum.”`,
        alternative: "“Gecikmenin yalnızca benim çalışma planımdan kaynaklanmadığını düşünüyorum; ancak bağımlılıkları daha erken görünür hale getirme sorumluluğum olduğunu kabul ediyorum.”",
        reaction: "Yönetici: “Bu riski daha önce neden paylaşmadınız?”",
        continuation: "“Sürecin planlanan tarihte tamamlanacağını öngördüğüm için yeterince erken paylaşmadım. Bundan sonraki süreçte riskleri kritik tarihten önce bildireceğim.”",
        close: closing,
        avoid: [...commonAvoid, "“Bu benim hatam değil.”", "“Diğer ekip yüzünden oldu.”"]
      },
      workload: {
        title: "İş yükünü öncelik ve kapasite üzerinden konuşun",
        assessment: "Genel bir yoğunluk ifadesi yerine, mevcut işlerin kapasite ve teslim tarihleri üzerindeki etkisini somutlaştırın.",
        main: `${opening} “Mevcut sorumluluklarımı ve teslim tarihlerini birlikte değerlendirdiğimde, X ve Y işlerinin aynı dönemde tamamlanması risk oluşturuyor. Öncelik sırasını ve gerektiğinde ertelenebilecek kapsamı birlikte netleştirebilir miyiz?”`,
        alternative: "“Mevcut kapasitemle tüm başlıkları aynı kalite ve sürede tamamlamak mümkün görünmüyor. Öncelikleri ve beklenen teslim seviyesini birlikte belirlemeye ihtiyaç duyuyorum.”",
        reaction: "Yönetici: “Tüm ekip yoğun çalışıyor.”",
        continuation: "“Ekipteki yoğunluğun farkındayım. Benim paylaşmak istediğim konu, mevcut işlerin teslim tarihleri üzerindeki somut riski ve hangi önceliğin korunması gerektiği.”",
        close: closing,
        avoid: [...commonAvoid, "“Artık yetişemiyorum.”", "“Üzerimde çok fazla iş var.”"]
      },
      support: {
        title: "Destek talebini sonuç ve ihtiyaç üzerinden ifade edin",
        assessment: "Destek talebinde hangi engelin kaldırılması gerektiğini ve beklenen katkıyı açıkça belirtin.",
        main: `${opening} “X hedefinin planlanan tarihte ilerleyebilmesi için Y onayına ve Z kaynağına ihtiyaç duyuyorum. Bu desteğin hangi tarihte sağlanabileceğini netleştirebilir miyiz?”`,
        alternative: "“Sorumluluğumdaki aksiyonları tamamlayabilmem için karar, kaynak veya öncelik desteğine ihtiyaç duyduğum noktaları paylaşmak istiyorum.”",
        reaction: "Yönetici: “Önce kendi çözümünüzü üretmenizi bekliyorum.”",
        continuation: "“Değerlendirdiğim seçenekler A ve B. Ancak karar yetkisi veya kaynak ihtiyacı nedeniyle Y noktasında yönetsel desteğe ihtiyaç duyuyorum.”",
        close: closing,
        avoid: [...commonAvoid, "“Bana destek olunmuyor.”", "“Bu koşullarda yapamam.”"]
      },
      development: {
        title: "Gelişim beklentinizi iş hedefleriyle ilişkilendirin",
        assessment: "Gelişim talebini yalnızca eğitim isteği olarak değil, üstleneceğiniz sorumluluk ve beklenen katkıyla birlikte açıklayın.",
        main: `${opening} “Kalan dönemde X alanında daha fazla sorumluluk alarak gelişmek istiyorum. Bu gelişimin iş hedeflerine katkı sağlayabilmesi için hangi görev, proje veya öğrenme fırsatlarını önceliklendirmemi önerirsiniz?”`,
        alternative: "“Teknik uzmanlığımı Y konusunda derinleştirmek ve bunu Z projesinde uygulamak istiyorum. Bu hedef için hangi deneyimi edinmem gerektiğini birlikte netleştirebilir miyiz?”",
        reaction: "Yönetici: “Önce mevcut sorumluluklarınızda daha güçlü sonuç bekliyorum.”",
        continuation: "“Bu beklentiyi dikkate alarak gelişim hedefimi mevcut sorumluluklarımla ilişkilendirebilirim. Öncelikle hangi sonuçların güçlenmesi gerektiğini netleştirelim.”",
        close: closing,
        avoid: [...commonAvoid, "Yalnızca eğitim adı belirtmek", "Gelişim hedefini mevcut performanstan bağımsız anlatmak"]
      },
      rewrite: {
        title: "Cümleyi profesyonel ve somut bir yapıya dönüştürün",
        assessment: raw
          ? `“${raw}” ifadesi kesin yargı veya duygusal değerlendirme içeriyorsa görüşmeyi veriden uzaklaştırabilir.`
          : "İfadeyi somut örnek, değerlendirme ölçütü ve beklenti üzerinden yeniden kurun.",
        main: raw && normalize(raw).includes("haksiz")
          ? "“Değerlendirmenin bazı bölümlerine ilişkin farklı bir görüşüm bulunuyor. Kullanılan örnekleri ve değerlendirme ölçütlerini birlikte inceleyebilir miyiz? Ardından kendi değerlendirmemi somut sonuçlarla paylaşmak isterim.”"
          : "“Bu değerlendirmeye ilişkin farklı düşündüğüm noktaları somut örnekler üzerinden paylaşmak ve beklentiyi netleştirmek istiyorum.”",
        alternative: "“Geri bildiriminizdeki beklentiyi anlamakla birlikte, dönem içindeki bazı sonuçların da değerlendirmeye dahil edilmesi gerektiğini düşünüyorum.”",
        reaction: "Yönetici: “Hangi bölüme katılmıyorsunuz?”",
        continuation: "“Özellikle X başlığındaki değerlendirmeye farklı yaklaşıyorum. Bunun nedenini Y sonucu ve Z örneği üzerinden açıklayabilirim.”",
        close: closing,
        avoid: [...commonAvoid, raw ? `“${raw}” ifadesini doğrudan kullanmak` : "Duygusal veya kesin yargılar"]
      },
      general: {
        title: "Görüşünüzü somut örnek ve beklenti üzerinden ifade edin",
        assessment: "Ele almak istediğiniz konuyu belirli bir olay, sonuç veya beklentiyle ilişkilendirin.",
        main: `${opening} “Bu konudaki değerlendirmemi X örneği üzerinden paylaşmak istiyorum. Mevcut durumun iş sonucuna etkisi Y oldu. Kalan dönem için hangi yaklaşımın beklendiğini netleştirebilir miyiz?”`,
        alternative: "“Kendi değerlendirmemi ve ilgili sonuçları paylaşarak, beklentiyi daha somut hale getirmek istiyorum.”",
        reaction: "Yönetici: “Bu konuyu neden şimdi gündeme getiriyorsunuz?”",
        continuation: "“Ara değerlendirme görüşmesinin, mevcut durumu ve kalan dönem önceliklerini netleştirmek için uygun bir zaman olduğunu düşünüyorum.”",
        close: closing,
        avoid: commonAvoid
      }
    }
  };

  let selected = responses[role][category] || responses[role].general;

  if (mode === "shorter") {
    selected = {
      ...selected,
      assessment: selected.assessment.split(".")[0] + ".",
      main: selected.alternative,
      alternative: selected.main
    };
  }

  if (mode === "clearer") {
    selected = {
      ...selected,
      assessment: "Mesajı dolaylılaştırmadan; somut örnek, beklenti ve aksiyon üzerinden ifade edin.",
      main: selected.alternative,
      alternative: selected.main
    };
  }

  if (mode === "diplomatic") {
    selected = {
      ...selected,
      assessment: "Farklı görüşleri dışlamadan, değerlendirme ölçütünü ve beklentiyi birlikte netleştirin.",
      main: selected.main.replace("bekliyorum", "önemli görüyorum"),
      alternative: selected.alternative
    };
  }

  return selected;
}

function setRole(role) {
  state.role = role;
  state.variantIndex = 0;
  roleScreen.classList.add("hidden");
  workspace.classList.remove("hidden");

  const isManager = role === "manager";
  roleBadgeText.textContent = isManager ? "Yönetici" : "Çalışan";
  roleBadgeIcon.textContent = isManager ? "Y" : "Ç";
  workspaceTitle.textContent = isManager
    ? "Çalışanınızla hangi konuyu konuşmak istiyorsunuz?"
    : "Yöneticinizle hangi konuyu konuşmak istiyorsunuz?";
  inputLabel.textContent = isManager
    ? "Yaşadığınız durumu veya söylemekte zorlandığınız cümleyi yazın."
    : "Aldığınız geri bildirimi, açıklamak istediğiniz durumu veya söylemekte zorlandığınız cümleyi yazın.";
  userInput.placeholder = isManager
    ? "Örnek: Çalışanım hedefinin gerisinde ancak çok emek verdiğini söylüyor. Bunu nasıl konuşabilirim?"
    : "Örnek: Yöneticim yeterince inisiyatif almadığımı söyledi. Ne yanıt verebilirim?";

  renderScenarios();
  clearWorkspace();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderScenarios() {
  scenarioList.innerHTML = "";
  scenarios[state.role].forEach(text => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scenario-button";
    button.textContent = text;
    button.addEventListener("click", () => {
      userInput.value = text;
      updateCharCount();
      generate();
    });
    scenarioList.appendChild(button);
  });
}

function renderResult(result) {
  state.lastResult = result;
  emptyState.classList.add("hidden");
  resultArea.classList.remove("hidden");
  resultTitle.textContent = result.title;

  const cards = [
    { title: "Duruma ilişkin değerlendirme", text: result.assessment, className: "" },
    { title: "Görüşmede kullanabileceğiniz ifade", text: result.main, className: "primary" },
    { title: "Alternatif ifade", text: result.alternative, className: "" },
    { title: "Olası karşılık", text: result.reaction, className: "" },
    { title: "Görüşmeye şöyle devam edebilirsiniz", text: result.continuation, className: "" },
    { title: "Görüşmeyi kapatırken", text: result.close, className: "" },
    { title: "Kaçınılması gereken ifadeler", list: result.avoid, className: "" }
  ];

  responseCards.innerHTML = cards.map((card, index) => `
    <article class="response-card ${card.className}">
      <h4>${card.title}</h4>
      ${card.list
        ? `<ul>${card.list.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : `<p>${escapeHtml(card.text)}</p>`}
      <button class="copy-card" type="button" data-copy-index="${index}" title="Kopyala">⧉</button>
    </article>
  `).join("");

  responseCards.querySelectorAll("[data-copy-index]").forEach(button => {
    button.addEventListener("click", () => {
      const card = cards[Number(button.dataset.copyIndex)];
      const text = card.list ? card.list.join("\n") : card.text;
      copyText(text);
    });
  });

  resultArea.scrollIntoView({ behavior: "smooth", block: "start" });
}

function generate(mode = "standard") {
  const text = userInput.value.trim();

  if (!text) {
    showToast("Lütfen görüşmede ele almak istediğiniz konuyu yazın.");
    userInput.focus();
    return;
  }

  if (text.length < 12) {
    showToast("Daha uygun bir öneri için durumu biraz daha somutlaştırın.");
    userInput.focus();
    return;
  }

  const category = classify(text);
  const result = createResponse(state.role, category, text, mode);
  renderResult(result);
}

function clearWorkspace() {
  userInput.value = "";
  updateCharCount();
  state.lastResult = null;
  emptyState.classList.remove("hidden");
  resultArea.classList.add("hidden");
  responseCards.innerHTML = "";
}

function updateCharCount() {
  charCount.textContent = `${userInput.value.length} / 1200`;
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Metin kopyalandı.");
  }).catch(() => {
    showToast("Metin kopyalanamadı.");
  });
}

function copyAll() {
  if (!state.lastResult) return;
  const r = state.lastResult;
  const text = [
    r.title,
    "",
    "Duruma ilişkin değerlendirme",
    r.assessment,
    "",
    "Görüşmede kullanabileceğiniz ifade",
    r.main,
    "",
    "Alternatif ifade",
    r.alternative,
    "",
    "Olası karşılık",
    r.reaction,
    "",
    "Görüşmeye şöyle devam edebilirsiniz",
    r.continuation,
    "",
    "Görüşmeyi kapatırken",
    r.close,
    "",
    "Kaçınılması gereken ifadeler",
    ...r.avoid.map(item => `- ${item}`)
  ].join("\n");
  copyText(text);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

document.querySelectorAll("[data-role]").forEach(button => {
  button.addEventListener("click", () => setRole(button.dataset.role));
});

generateButton.addEventListener("click", () => generate());
clearButton.addEventListener("click", clearWorkspace);
changeRoleButton.addEventListener("click", () => {
  workspace.classList.add("hidden");
  roleScreen.classList.remove("hidden");
  clearWorkspace();
  state.role = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

userInput.addEventListener("input", updateCharCount);
userInput.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    generate();
  }
});

document.getElementById("quickActions").addEventListener("click", event => {
  const action = event.target.dataset.action;
  if (!action) return;
  if (action === "alternative") {
    state.variantIndex += 1;
    generate("standard");
  } else {
    generate(action);
  }
});

copyAllButton.addEventListener("click", copyAll);

guideButton.addEventListener("click", () => guideDialog.showModal());
closeGuideButton.addEventListener("click", () => guideDialog.close());
guideDialog.addEventListener("click", event => {
  const rect = guideDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;
  if (outside) guideDialog.close();
});
