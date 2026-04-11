(function initTarotContent(root, factory) {
  const payload = factory();

  root.TAROT_CARD_CONTENT = payload.TAROT_CARD_CONTENT;
  root.APP_COPY = payload.APP_COPY;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = payload;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildTarotContent() {
  const TAROT_CARD_CONTENT = {
    0: {
      canonicalNumber: 0,
      displayNumber: '0/22',
      name: '바보',
      englishName: 'The Fool',
      keywords: ['시작', '가능성', '순수함', '모험'],
      symbolismDescription: '절벽 끝에 선 인물과 작은 배낭, 흰 장미, 발치의 강아지가 함께 보이는 카드다. 아직 준비가 완벽하지 않아도 먼저 나아가려는 마음이 더 크게 느껴진다. 무모함과 가능성이 함께 들어 있는 첫 번째 에너지다.',
      profileDescription: '이 카드를 가진 사람은 틀에 잘 갇히지 않고 새로운 경험 앞에서 마음이 잘 열린다. 남들이 망설일 때 먼저 나서는 용기가 있지만, 중심을 잃으면 준비 없는 선택을 반복할 수 있다.',
      yearFlowDescription: '새로운 흐름이 열리는 해다. 처음 해보는 일과 새 관계에 운이 붙기 쉽다. 다만 자유와 책임의 균형을 같이 챙기는 것이 중요하다.'
    },
    1: {
      canonicalNumber: 1,
      displayNumber: '1',
      name: '마법사',
      englishName: 'The Magician',
      keywords: ['실행', '창조', '능력', '현실화'],
      symbolismDescription: '한 손은 하늘로, 한 손은 땅으로 향하며 영감과 현실을 연결하는 카드다. 테이블 위의 네 수트 도구는 이미 필요한 재료가 손안에 있음을 보여준다. 생각을 현실로 끌어오는 힘이 핵심이다.',
      profileDescription: '이 카드를 가진 사람은 아이디어를 내고 시작하고 설득하는 힘이 강하다. 실제로 무언가를 되게 만드는 능력이 분명하지만, 과하면 조급함이나 통제 욕구로 보일 수 있다.',
      yearFlowDescription: '시작하고 실행하는 힘이 커지는 해다. 머릿속 계획을 현실로 옮길수록 결과가 빨리 따라온다. 속도만 앞서지 않도록 점검과 마무리를 함께 챙겨야 한다.'
    },
    2: {
      canonicalNumber: 2,
      displayNumber: '2',
      name: '여사제',
      englishName: 'The High Priestess',
      keywords: ['직관', '내면', '신비', '관찰'],
      symbolismDescription: '흑백 기둥과 석류 장막 사이에 앉아 보이는 것과 보이지 않는 것의 경계를 지키는 카드다. 장막과 두루마리는 감춰진 지혜와 무의식의 세계를 상징한다. 바깥보다 안쪽의 목소리에 귀를 기울이게 한다.',
      profileDescription: '이 카드를 가진 사람은 겉으로 조용해 보여도 내면이 깊다. 사람의 말보다 분위기와 기류를 먼저 읽고, 쉽게 마음을 다 열지 않는다. 잘 살면 현명한 중심이 되고 과하면 거리감으로 오해받기 쉽다.',
      yearFlowDescription: '겉으로 빠르게 움직이기보다 안을 정리하는 해다. 답을 밖에서 찾기보다 내 직감과 감정의 결을 충분히 듣는 편이 중요하다. 서두르지 않아도 보이는 것이 많아진다.'
    },
    3: {
      canonicalNumber: 3,
      displayNumber: '3',
      name: '여황제',
      englishName: 'The Empress',
      keywords: ['풍요', '감각', '창조', '양육'],
      symbolismDescription: '풍성한 자연과 밀밭, 흐르는 물 속에서 결실과 돌봄의 힘을 보여주는 카드다. 억지로 밀어붙이기보다 잘 자라게 하고 풍성하게 만드는 힘이 중심에 있다.',
      profileDescription: '이 카드를 가진 사람은 따뜻하고 풍요로운 분위기를 만드는 힘이 있다. 감각이 좋고 사람이나 일을 키워내는 능력이 있지만, 중심을 놓치면 편안함에만 머무를 수 있다.',
      yearFlowDescription: '풍요와 성장의 흐름이 강해지는 해다. 관계와 일, 창작이 자연스럽게 확장되기 쉽고 나를 잘 돌볼수록 결과도 좋아진다. 즐김과 생산성을 함께 가져가면 좋다.'
    },
    4: {
      canonicalNumber: 4,
      displayNumber: '4',
      name: '황제',
      englishName: 'The Emperor',
      keywords: ['질서', '구조', '책임', '권위'],
      symbolismDescription: '돌 왕좌와 숫양 상징, 단단한 산맥이 함께 보이는 카드다. 감정보다 구조와 기준, 책임과 통제를 통해 흔들리지 않는 기반을 세우는 힘을 상징한다.',
      profileDescription: '이 카드를 가진 사람은 책임감이 강하고 기준을 세우는 능력이 좋다. 조직 안에서 중심 역할을 맡기 쉽지만, 중심을 잃으면 고집이 세고 통제적으로 보일 수 있다.',
      yearFlowDescription: '기반을 세우고 틀을 잡는 해다. 감정보다 구조, 기세보다 계획이 중요해진다. 경계와 원칙을 세울수록 안정이 생기지만 유연성도 조금 남겨두는 편이 좋다.'
    },
    5: {
      canonicalNumber: 5,
      displayNumber: '5',
      name: '교황',
      englishName: 'The Hierophant',
      keywords: ['전통', '가르침', '제도', '연결'],
      symbolismDescription: '두 기둥 사이에 앉은 교황과 두 제자, 열쇠 상징이 강조되는 카드다. 개인의 직감보다 전통과 제도, 스승과 배움을 통해 길이 열리는 구조를 보여준다.',
      profileDescription: '이 카드를 가진 사람은 관계와 제도를 잘 활용할 줄 안다. 믿을 만한 기준을 세워주고 누군가를 연결하는 역할에 강하다. 과하면 남의 기준에 지나치게 기대는 모습으로 흐를 수 있다.',
      yearFlowDescription: '배우고 연결되고, 제도 안에서 길이 열리는 해다. 멘토, 소개, 계약, 공식 절차를 잘 활용할수록 일이 풀린다. 다만 내 가치와 맞는 연결인지 분별하는 것이 중요하다.'
    },
    6: {
      canonicalNumber: 6,
      displayNumber: '6',
      name: '연인',
      englishName: 'The Lovers',
      keywords: ['사랑', '관계', '조화', '선택'],
      symbolismDescription: '천사 아래 선 두 인물과 서로 다른 시선의 흐름이 핵심인 카드다. 사랑의 이미지가 강하지만, 실제로는 관계 속에서 무엇을 선택하고 어떤 가치에 설지 묻는 카드에 가깝다.',
      profileDescription: '이 카드를 가진 사람은 사람과의 연결에서 힘을 얻고 관계를 중요한 가치로 느낀다. 다정하고 진심이 깊지만, 선택의 순간이 많아 오래 고민하기도 한다. 중심을 잃으면 관계에 지나치게 흔들릴 수 있다.',
      yearFlowDescription: '관계와 선택이 핵심 주제가 되는 해다. 사랑과 협업, 가까운 인간관계에서 중요한 결정을 하게 될 수 있다. 관계를 통해 성장하되 중심은 스스로 잡는 편이 좋다.'
    },
    7: {
      canonicalNumber: 7,
      displayNumber: '7',
      name: '전차',
      englishName: 'The Chariot',
      keywords: ['의지', '추진력', '승리', '전진'],
      symbolismDescription: '검은 스핑크스와 흰 스핑크스, 전사의 갑옷과 상징들이 함께 보이는 카드다. 고삐가 없다는 점이 중요해서, 물리적 힘보다 정신적 통제와 방향성으로 움직이는 힘을 말한다.',
      profileDescription: '이 카드를 가진 사람은 목표를 정하면 끝까지 밀어붙이는 힘이 있다. 행동으로 결과를 내는 편이지만, 방향이 흐려지면 에너지만 강하고 산만하게 흩어질 수 있다.',
      yearFlowDescription: '밀고 나가는 힘이 강해지는 해다. 목표를 분명히 세우고 속도를 붙일수록 결과가 난다. 이동과 도전, 경쟁의 흐름이 강하므로 무엇을 향해 가는지부터 선명하게 정해야 한다.'
    },
    8: {
      canonicalNumber: 8,
      displayNumber: '8',
      name: '힘',
      englishName: 'Strength',
      keywords: ['인내', '내면의 힘', '조절', '회복력'],
      symbolismDescription: '여인이 사자의 이마와 입가를 부드럽게 다루는 장면이 핵심이다. 중요한 것은 억누름보다 길들임이며, 사자는 본능과 감정을, 여인은 침착함과 사랑을 상징한다. 오래 버티며 다스리는 내면의 힘을 말한다.',
      profileDescription: '이 카드를 가진 사람은 겉보다 속이 훨씬 강하다. 큰 소리보다 묵묵히 버티고, 사람이나 상황을 부드럽게 조율하는 힘이 있다. 너무 오래 참으면 감정이 한꺼번에 터질 수 있어 표현하는 힘도 중요하다.',
      yearFlowDescription: '겉으로 크게 요동치기보다 안에서 단단해지는 해다. 인내와 감정 조절, 회복력이 큰 힘이 된다. 참기만 하지 말고 표현과 휴식의 균형을 챙기는 편이 좋다.'
    },
    9: {
      canonicalNumber: 9,
      displayNumber: '9',
      name: '은둔자',
      englishName: 'The Hermit',
      keywords: ['성찰', '탐구', '지혜', '안내'],
      symbolismDescription: '설산 위에 선 인물과 등불, 지팡이가 핵심 상징이다. 등불이 몇 걸음 앞만 비춘다는 점이 중요해서 한 번에 다 알 수 없어도 차분히 나아가는 지혜를 말한다.',
      profileDescription: '이 카드를 가진 사람은 혼자 있는 시간을 통해 깊어지는 타입이다. 쉽게 휩쓸리지 않고 시간을 들여 본질을 이해하려 한다. 잘 살면 조언자나 전문가 같은 힘이 생기지만, 과하면 고립으로 흐를 수 있다.',
      yearFlowDescription: '밖으로 넓히기보다 안으로 깊어지는 해다. 공부, 정리, 탐구, 치유가 중요해지고 사람 수보다 방향의 선명함이 더 중요해진다. 서두르지 말고 길을 가다듬는 편이 좋다.'
    },
    10: {
      canonicalNumber: 10,
      displayNumber: '10',
      name: '운명의 수레바퀴',
      englishName: 'Wheel of Fortune',
      keywords: ['전환점', '흐름', '운', '순환'],
      symbolismDescription: '거대한 바퀴와 스핑크스, 뱀, 아누비스가 함께 등장해 변화 속의 질서를 보여주는 카드다. 내가 모든 것을 통제하기보다 사이클과 전환의 타이밍을 읽어야 함을 말한다.',
      profileDescription: '이 카드를 가진 사람은 흐름의 변화를 잘 타는 편이다. 이동과 전환 속에서 기회가 열리기도 한다. 잘 살면 변화에 유연하지만, 중심을 잃으면 들쭉날쭉해 보일 수 있다.',
      yearFlowDescription: '큰 전환점이 들어오는 해다. 계획하지 않았던 기회나 변화가 열릴 수 있다. 모든 것을 통제하려 하기보다 오는 흐름을 잘 읽고 올라타는 편이 중요하다.'
    },
    11: {
      canonicalNumber: 11,
      displayNumber: '11',
      name: '정의',
      englishName: 'Justice',
      keywords: ['균형', '공정함', '판단', '책임'],
      symbolismDescription: '칼과 저울을 든 인물이 두 기둥 사이에 앉아 있는 카드다. 감정만이 아니라 결과와 책임까지 함께 보는 시선을 의미한다. 명확한 판단과 균형이 핵심이다.',
      profileDescription: '이 카드를 가진 사람은 상황을 객관적으로 보려는 힘이 강하다. 일관성과 공정함을 중요하게 생각해 신뢰를 주지만, 과하면 차갑고 계산적으로 보일 수 있다.',
      yearFlowDescription: '결과와 책임이 또렷하게 드러나는 해다. 기준, 계약, 정산, 관계의 균형 문제가 중요하게 떠오른다. 감정보다 공정함과 일관성을 기준으로 선택하는 편이 좋다.'
    },
    12: {
      canonicalNumber: 12,
      displayNumber: '12',
      name: '매달린 사람',
      englishName: 'The Hanged Man',
      keywords: ['멈춤', '유예', '희생', '관점 전환'],
      symbolismDescription: '거꾸로 매달려 있으면서도 평온한 얼굴을 한 인물이 인상적인 카드다. 완전한 속박보다 자발적 멈춤과 새로운 관점을 상징한다. 억지로 전진하기보다 멈춤 속에서 답을 보게 한다.',
      profileDescription: '이 카드를 가진 사람은 남들과 다른 방식으로 세상을 보는 경우가 많다. 쉽게 휩쓸리지 않고 깊게 생각한다. 잘 살면 통찰이 되지만, 과하면 스스로를 오래 묶어둘 수 있다.',
      yearFlowDescription: '속도가 늦어지는 것처럼 보여도 사실은 관점을 바꾸는 해다. 계획이 보류되더라도 그 안의 통찰이 크다. 멈춤을 손해로만 보지 않는 시선이 중요하다.'
    },
    13: {
      canonicalNumber: 13,
      displayNumber: '13',
      name: '죽음',
      englishName: 'Death',
      keywords: ['끝', '전환', '정리', '변형'],
      symbolismDescription: '겉보기 인상은 강하지만 실제로는 큰 종료와 전환을 뜻하는 카드다. 이전 단계가 끝나야 다음 문이 열리는 구조를 상징하며, 낡은 것을 벗겨내는 정리와 변형의 의미가 크다.',
      profileDescription: '이 카드를 가진 사람은 크고 작은 전환을 여러 번 겪으며 성장하는 편이다. 끝내야 할 때를 감지하면 과감히 정리하는 힘이 있다. 정리를 미루면 혼란이 더 커질 수 있다.',
      yearFlowDescription: '정리와 전환이 강하게 들어오는 해다. 맞지 않는 방식은 자연스럽게 떨어져 나갈 수 있다. 붙잡기보다 비워낼수록 다음 흐름이 빨리 열린다.'
    },
    14: {
      canonicalNumber: 14,
      displayNumber: '14',
      name: '절제',
      englishName: 'Temperance',
      keywords: ['조율', '균형', '치유', '통합'],
      symbolismDescription: '한 발은 물에, 한 발은 땅에 둔 천사가 두 컵 사이로 물을 옮기는 장면이 핵심이다. 서로 다른 것을 섞어 더 좋은 균형을 만드는 힘, 회복과 조율의 흐름을 상징한다.',
      profileDescription: '이 카드를 가진 사람은 극단으로 치닫기보다 중간을 잡는 능력이 좋다. 갈등을 조율하고 다른 의견을 섞어 새로운 균형을 만드는 데 강하다. 과하면 결정이 늦어질 수 있다.',
      yearFlowDescription: '올해는 극단보다 균형이 중요하다. 속도를 조율하고 여러 요소를 잘 섞을수록 일이 안정적으로 풀린다. 오래 가는 안정감을 만드는 해로 쓰면 가장 좋다.'
    },
    15: {
      canonicalNumber: 15,
      displayNumber: '15',
      name: '악마',
      englishName: 'The Devil',
      keywords: ['욕망', '집착', '유혹', '속박'],
      symbolismDescription: '악 그 자체보다 빠져나올 수 있는데도 익숙한 욕망과 쾌락에 묶여 있는 상태를 보여주는 카드다. 강한 끌림과 강한 속박이 동시에 들어 있어, 욕망을 어떻게 다루는지가 핵심이 된다.',
      profileDescription: '이 카드를 가진 사람은 몰입력이 매우 강하고 한번 빠지면 깊이 들어간다. 잘 살면 강한 집중력과 카리스마가 되지만, 과하면 집착과 의존으로 흐르기 쉽다.',
      yearFlowDescription: '욕망과 집착, 돈과 관계의 패턴을 직면하게 되는 해다. 잘 쓰면 큰 성과가 나지만 못 쓰면 과몰입으로 흐르기 쉽다. 자유를 잃지 않는 선에서 욕망을 다루는 것이 중요하다.'
    },
    16: {
      canonicalNumber: 16,
      displayNumber: '16',
      name: '탑',
      englishName: 'The Tower',
      keywords: ['붕괴', '충격', '폭로', '각성'],
      symbolismDescription: '높은 탑에 번개가 내리치고 왕관이 날아가는 장면이 핵심인 카드다. 단단해 보였지만 불안정한 토대 위에 있던 구조가 무너지는 순간을 보여준다. 파괴와 함께 폭로와 통찰의 의미를 가진다.',
      profileDescription: '이 카드를 가진 사람은 큰 사건을 통해 깨어나는 경우가 많다. 위기를 지나고 나면 더 진짜인 삶으로 옮겨가는 힘이 있다. 다만 변화의 순간에는 소모가 커서 신호를 미리 읽는 습관이 중요하다.',
      yearFlowDescription: '예상치 못한 변화가 기존 구조를 흔들 수 있는 해다. 숨겨진 진실이 드러나고 더 이상 유지되지 않던 것이 무너질 수 있다. 불편한 진실을 빨리 인정할수록 재정비도 빨라진다.'
    },
    17: {
      canonicalNumber: 17,
      displayNumber: '17',
      name: '별',
      englishName: 'The Star',
      keywords: ['희망', '치유', '영감', '방향성'],
      symbolismDescription: '물가에 무릎을 꿇은 여인이 두 물병으로 물을 붓는 장면이 상징적이다. 메마른 자리에 생기를 돌려놓고, 상처 뒤에 다시 살아나는 마음의 빛을 보여주는 카드다.',
      profileDescription: '이 카드를 가진 사람은 밝고 맑은 인상을 주며 상처 뒤에도 다시 일어나는 회복력이 있다. 잘 살면 영감과 치유를 건네는 사람이 되지만, 과하면 이상만 크고 실행이 느려질 수 있다.',
      yearFlowDescription: '회복과 희망의 빛이 들어오는 해다. 마음이 다시 살아나고 표현과 창작, 관계 회복에도 좋은 흐름이 들어온다. 보이는 희망을 실제 행동으로 이어가면 훨씬 좋다.'
    },
    18: {
      canonicalNumber: 18,
      displayNumber: '18',
      name: '달',
      englishName: 'The Moon',
      keywords: ['무의식', '불안', '직감', '혼란'],
      symbolismDescription: '달빛 아래 가재와 개, 늑대, 멀리 이어지는 길이 함께 보이는 카드다. 모든 것이 또렷하게 드러나지 않는 상태를 뜻하며, 직감과 상상력이 커지는 대신 불안과 착각도 함께 커질 수 있다.',
      profileDescription: '이 카드를 가진 사람은 감정의 결이 섬세하고 분위기와 숨은 흐름을 잘 읽는다. 촉과 상상력이 풍부하지만, 과하면 불안과 의심에 쉽게 끌려갈 수 있다.',
      yearFlowDescription: '확실하지 않은 감정과 상황을 통과하는 해다. 직감은 예민해지지만 확인되지 않은 감정에 휘둘리지 않는 태도가 중요하다. 애매한 관계와 조건은 천천히 확인하면서 가는 편이 안전하다.'
    },
    19: {
      canonicalNumber: 19,
      displayNumber: '19',
      name: '태양',
      englishName: 'The Sun',
      keywords: ['성공', '명확함', '기쁨', '생명력'],
      symbolismDescription: '거대한 태양 아래 흰 말을 탄 아이와 해바라기가 함께 보이는 카드다. 숨김없는 순수함과 생명력, 드러남과 잘됨의 기운이 선명하게 느껴진다.',
      profileDescription: '이 카드를 가진 사람은 밝고 솔직하며 존재 자체로 분위기를 환하게 만든다. 중요한 순간에 결과를 만들어내는 힘이 있지만, 과하면 과신으로 보일 수 있다.',
      yearFlowDescription: '밝고 명확한 에너지가 강해지는 해다. 가려졌던 것이 드러나고 장점도 더 선명하게 보일 수 있다. 좋은 흐름을 실제 성과로 굳히는 것이 중요하다.'
    },
    20: {
      canonicalNumber: 20,
      displayNumber: '20',
      name: '심판',
      englishName: 'Judgement',
      keywords: ['각성', '부름', '재평가', '부활'],
      symbolismDescription: '천사가 나팔을 불고 사람들이 무덤에서 다시 일어나는 장면이 담긴 카드다. 벌의 의미보다 더 이상 예전처럼 살 수 없게 되는 깨어남과 중요한 결단의 순간에 가깝다.',
      profileDescription: '이 카드를 가진 사람은 어느 순간 크게 각성하는 경험을 하기 쉽다. 과거의 시간을 헛되게 두지 않고 배움을 뽑아내는 힘이 있다. 다만 자기비판이 강해지면 스스로를 오래 심판할 수 있다.',
      yearFlowDescription: '이제 정말 결정해야 하는 것이 떠오르는 해다. 미뤄둔 문제를 정리하고 중요한 연락이나 재평가, 진로 결정을 만나기 쉽다. 예전 방식으로 머물 수 없다는 깨달음이 커질수록 새 단계도 빨리 열린다.'
    },
    21: {
      canonicalNumber: 21,
      displayNumber: '21',
      name: '세계',
      englishName: 'The World',
      keywords: ['완성', '통합', '성취', '확장'],
      symbolismDescription: '원환 안에서 춤추는 인물과 네 모서리의 존재들이 한 사이클의 완성과 다음 시작을 함께 보여준다. 끝이면서 시작이고, 성취이면서 확장인 카드다.',
      profileDescription: '이 카드를 가진 사람은 한 사이클을 끝까지 완성해내는 힘이 있다. 시야가 넓고 경험을 통합하는 능력이 있지만, 과하면 완벽하게 끝내고 싶어 마무리를 늦출 수 있다.',
      yearFlowDescription: '한 사이클을 완성하고 다음 단계로 넘어가는 해다. 오래 끌어온 일과 관계, 공부가 하나의 결실을 맺기 쉽다. 끝맺음을 미루지 말고 다음 시작으로 자연스럽게 넘어가는 것이 중요하다.'
    }
  };

  const APP_COPY = {
    birth: {
      title: '탄생카드',
      definition: '탄생카드는 내가 타고난 중심 성향을 의미합니다.'
    },
    persona: {
      title: '페르소나 카드',
      definition: '페르소나 카드는 사회 속에서 드러나는 나의 얼굴을 의미합니다.'
    },
    wing: {
      title: '날개 카드',
      definition: '날개 카드는 내가 내 카드답게 살지 못할 때 기울어지는 방향을 의미합니다.'
    },
    personaEmpty: {
      title: '단일 카드 타입',
      keywords: ['겉과 속의 결이 가깝다', '자연스러운 일치'],
      symbolismDescription: '이번 계산에서는 별도 페르소나 카드가 나오지 않았어요. 중간 축약 과정에서 10부터 22 사이의 값이 직접 나타나지 않았기 때문입니다.',
      profileDescription: '바깥으로 드러나는 모습도 탄생카드의 결을 크게 공유합니다. 타고난 성향과 사회적 인상이 비교적 자연스럽게 이어지는 타입으로 읽을 수 있습니다.'
    },
    messages: {
      invalidDate: '생년월일을 YYYY.MM.DD 형식의 실제 날짜로 입력해주세요.',
      futureDate: '미래 날짜는 입력할 수 없어요.',
      shareFallback: '카카오 공유는 아직 연결되지 않았어요. 결과 텍스트를 복사했어요.',
      shareUnavailable: '공유 기능을 준비 중이에요. 잠시 후 다시 시도해주세요.'
    }
  };

  return {
    TAROT_CARD_CONTENT,
    APP_COPY
  };
});
