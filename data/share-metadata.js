(function initShareMetadata(root, factory) {
  const payload = factory();

  root.SHARE_METADATA = payload.SHARE_METADATA;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = payload;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildShareMetadata() {
  const commonButtonTitle = '결과 보기';
  const getCardImageUrl = (slug) => `images/share/${slug}.png`;

  const SHARE_METADATA = {
    default: {
      title: '당신의 타로 결과를 확인해보세요',
      description: '지금의 결을 읽어주는 타로 프로필입니다. 자세한 해석을 눌러 확인해보세요.',
      imageUrl: getCardImageUrl('default'),
      buttonTitle: commonButtonTitle,
      keywords: ['타로', '자기이해', '흐름']
    },
    fool: { title: '당신의 타로 카드는 바보', description: '가볍게 열려 있는 마음과 새로운 가능성이 강한 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('fool'), buttonTitle: commonButtonTitle, keywords: ['자유', '가능성', '시작'] },
    magician: { title: '당신의 타로 카드는 마법사', description: '생각을 현실로 옮기는 힘이 선명한 카드입니다. 지금의 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('magician'), buttonTitle: commonButtonTitle, keywords: ['실행', '창조', '표현'] },
    high_priestess: { title: '당신의 타로 카드는 여사제', description: '조용하지만 깊은 직관이 잘 드러나는 카드입니다. 당신의 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('high_priestess'), buttonTitle: commonButtonTitle, keywords: ['직관', '내면', '감각'] },
    empress: { title: '당신의 타로 카드는 여황제', description: '풍요와 감각, 돌봄의 결이 살아 있는 카드입니다. 자세한 결과를 눌러 확인해보세요.', imageUrl: getCardImageUrl('empress'), buttonTitle: commonButtonTitle, keywords: ['풍요', '감각', '창조'] },
    emperor: { title: '당신의 타로 카드는 황제', description: '기준을 세우고 삶의 틀을 만드는 힘이 큰 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('emperor'), buttonTitle: commonButtonTitle, keywords: ['구조', '책임', '안정'] },
    hierophant: { title: '당신의 타로 카드는 교황', description: '배움과 연결, 믿을 만한 기준이 중심이 되는 카드입니다. 당신의 결과를 눌러 확인해보세요.', imageUrl: getCardImageUrl('hierophant'), buttonTitle: commonButtonTitle, keywords: ['배움', '연결', '기준'] },
    lovers: { title: '당신의 타로 카드는 연인', description: '관계와 선택의 순간에서 더 선명해지는 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('lovers'), buttonTitle: commonButtonTitle, keywords: ['관계', '조화', '선택'] },
    chariot: { title: '당신의 타로 카드는 전차', description: '의지와 추진력으로 앞으로 나아가는 결이 강한 카드입니다. 당신의 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('chariot'), buttonTitle: commonButtonTitle, keywords: ['전진', '의지', '도전'] },
    strength: { title: '당신의 타로 카드는 힘', description: '부드러운 인내와 단단한 내면이 잘 드러나는 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('strength'), buttonTitle: commonButtonTitle, keywords: ['인내', '회복력', '조절'] },
    hermit: { title: '당신의 타로 카드는 은둔자', description: '혼자 깊어질수록 더 빛나는 지혜의 카드입니다. 당신의 결과를 눌러 확인해보세요.', imageUrl: getCardImageUrl('hermit'), buttonTitle: commonButtonTitle, keywords: ['성찰', '지혜', '탐구'] },
    wheel_of_fortune: { title: '당신의 타로 카드는 운명의 수레바퀴', description: '변화의 흐름을 타고 전환점으로 나아가는 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('wheel_of_fortune'), buttonTitle: commonButtonTitle, keywords: ['전환', '흐름', '타이밍'] },
    justice: { title: '당신의 타로 카드는 정의', description: '균형과 판단, 일관성이 중심이 되는 카드입니다. 당신의 결과를 눌러 확인해보세요.', imageUrl: getCardImageUrl('justice'), buttonTitle: commonButtonTitle, keywords: ['균형', '판단', '책임'] },
    hanged_man: { title: '당신의 타로 카드는 매달린 사람', description: '멈춤 속에서 새로운 시선을 얻는 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('hanged_man'), buttonTitle: commonButtonTitle, keywords: ['멈춤', '관점', '전환'] },
    death: { title: '당신의 타로 카드는 죽음', description: '끝과 정리를 지나 다음 흐름으로 넘어가는 카드입니다. 당신의 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('death'), buttonTitle: commonButtonTitle, keywords: ['정리', '전환', '변형'] },
    temperance: { title: '당신의 타로 카드는 절제', description: '서로 다른 결을 조율해 균형을 만드는 카드입니다. 자세한 결과를 눌러 확인해보세요.', imageUrl: getCardImageUrl('temperance'), buttonTitle: commonButtonTitle, keywords: ['조율', '균형', '치유'] },
    devil: { title: '당신의 타로 카드는 악마', description: '강한 욕망과 몰입의 힘을 어떻게 쓰는지가 중요한 카드입니다. 당신의 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('devil'), buttonTitle: commonButtonTitle, keywords: ['욕망', '몰입', '집중'] },
    tower: { title: '당신의 타로 카드는 탑', description: '익숙한 구조를 흔들며 더 진짜인 방향으로 이끄는 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('tower'), buttonTitle: commonButtonTitle, keywords: ['변화', '각성', '재정비'] },
    star: { title: '당신의 타로 카드는 별', description: '회복과 희망, 다시 살아나는 마음의 빛이 담긴 카드입니다. 당신의 결과를 눌러 확인해보세요.', imageUrl: getCardImageUrl('star'), buttonTitle: commonButtonTitle, keywords: ['희망', '치유', '영감'] },
    moon: { title: '당신의 타로 카드는 달', description: '섬세한 감정과 직감이 깊게 움직이는 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('moon'), buttonTitle: commonButtonTitle, keywords: ['직감', '감정', '무의식'] },
    sun: { title: '당신의 타로 카드는 태양', description: '밝고 명확한 생명력이 선명하게 드러나는 카드입니다. 당신의 결과를 눌러 확인해보세요.', imageUrl: getCardImageUrl('sun'), buttonTitle: commonButtonTitle, keywords: ['명확함', '기쁨', '생명력'] },
    judgement: { title: '당신의 타로 카드는 심판', description: '이제는 정말 방향을 정해야 하는 각성의 카드입니다. 자세한 해석을 눌러 확인해보세요.', imageUrl: getCardImageUrl('judgement'), buttonTitle: commonButtonTitle, keywords: ['각성', '재평가', '결단'] },
    world: { title: '당신의 타로 카드는 세계', description: '하나의 사이클을 완성하고 더 넓은 단계로 넘어가는 카드입니다. 당신의 결과를 눌러 확인해보세요.', imageUrl: getCardImageUrl('world'), buttonTitle: commonButtonTitle, keywords: ['완성', '확장', '성취'] }
  };

  return {
    SHARE_METADATA
  };
});
