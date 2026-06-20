// Web Speech API wrapper for voice navigation & command support
export class VoiceSystem {
  private static recognition: any = null;
  private static synth: SpeechSynthesis = window.speechSynthesis;

  static init(): void {
    if (this.recognition) return;
    
    // Check speech recognition support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  static startListening(
    langCode: string,
    onResult: (transcript: string) => void,
    onEnd?: () => void
  ): void {
    this.init();
    if (!this.recognition) {
      console.warn("Speech recognition is not supported in this browser.");
      if (onEnd) onEnd();
      return;
    }

    // Set voice language
    // en-US for English, hi-IN for Hindi, mr-IN for Marathi
    if (langCode === 'hi') this.recognition.lang = 'hi-IN';
    else if (langCode === 'mr') this.recognition.lang = 'mr-IN';
    else this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    this.recognition.onerror = (e: any) => {
      console.error("Speech Recognition Error:", e);
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      // recognition already running
      console.warn(e);
    }
  }

  static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  static speak(text: string, langCode: string): void {
    if (!this.synth) return;
    
    // Cancel ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to select a voice matching language
    let langTag = 'en-US';
    if (langCode === 'hi') langTag = 'hi-IN';
    else if (langCode === 'mr') langTag = 'mr-IN';
    utterance.lang = langTag;
    
    // Set appropriate speed/pitch for announcements
    utterance.rate = 0.95; 
    utterance.pitch = 1.0;

    this.synth.speak(utterance);
  }

  static processCommand(
    command: string,
    navigate: (path: string) => void,
    setLanguage: (lang: string) => void,
    triggerSOS: () => void
  ): { matched: boolean; response: string } {
    const cmd = command.toLowerCase().trim();
    
    // English Commands
    if (cmd.includes('show weather') || cmd.includes('weather forecast') || cmd.includes('check weather')) {
      navigate('/weather');
      return { matched: true, response: "Navigating to weather forecast" };
    }
    if (cmd.includes('open market') || cmd.includes('market price') || cmd.includes('mandi price')) {
      navigate('/market-prices');
      return { matched: true, response: "Opening market prices" };
    }
    if (cmd.includes('recommend crop') || cmd.includes('crop advisor') || cmd.includes('suggest crop')) {
      navigate('/crop-recommendation');
      return { matched: true, response: "Opening crop recommendation advisor" };
    }
    if (cmd.includes('check disease') || cmd.includes('plant scan') || cmd.includes('detect disease')) {
      navigate('/disease-detection');
      return { matched: true, response: "Opening camera for crop disease scanner" };
    }
    if (cmd.includes('find schemes') || cmd.includes('government scheme') || cmd.includes('open schemes')) {
      navigate('/schemes');
      return { matched: true, response: "Opening government schemes finder" };
    }
    if (cmd.includes('emergency help') || cmd.includes('send emergency') || cmd.includes('sos alert')) {
      triggerSOS();
      return { matched: true, response: "Emergency SOS activated. Sending location details." };
    }
    if (cmd.includes('switch to marathi') || cmd.includes('change to marathi') || cmd.includes('marathi language')) {
      setLanguage('mr');
      return { matched: true, response: "भाषा मराठी मध्ये बदलली आहे" };
    }
    if (cmd.includes('switch to hindi') || cmd.includes('change to hindi') || cmd.includes('hindi language')) {
      setLanguage('hi');
      return { matched: true, response: "भाषा हिंदी में बदल दी गई है" };
    }
    if (cmd.includes('switch to english') || cmd.includes('change to english') || cmd.includes('english language')) {
      setLanguage('en');
      return { matched: true, response: "Language switched to English" };
    }
    if (cmd.includes('go to dashboard') || cmd.includes('open dashboard') || cmd.includes('home')) {
      navigate('/dashboard');
      return { matched: true, response: "Opening farmer dashboard" };
    }

    // Marathi Commands
    if (cmd.includes('हवामान') || cmd.includes('पाऊस')) {
      navigate('/weather');
      return { matched: true, response: "हवामान अंदाज दाखवत आहे" };
    }
    if (cmd.includes('बाजार') || cmd.includes('भाव') || cmd.includes('दर')) {
      navigate('/market-prices');
      return { matched: true, response: "बाजार भाव दाखवत आहे" };
    }
    if (cmd.includes('पीक सल्ला') || cmd.includes('पीक शिफारस') || cmd.includes('पीक निवडा')) {
      navigate('/crop-recommendation');
      return { matched: true, response: "पीक सल्लागार उघडत आहे" };
    }
    if (cmd.includes('रोग ओळख') || cmd.includes('रोग तपासा') || cmd.includes('फोटो स्कॅन')) {
      navigate('/disease-detection');
      return { matched: true, response: "रोग ओळखण्यासाठी कॅमेरा सुरू करत आहे" };
    }
    if (cmd.includes('योजना') || cmd.includes('अनुदान')) {
      navigate('/schemes');
      return { matched: true, response: "शासकीय योजनांची यादी उघडत आहे" };
    }
    if (cmd.includes('मदत') || cmd.includes('आपत्कालीन') || cmd.includes('धोका')) {
      triggerSOS();
      return { matched: true, response: "आपत्कालीन मदतीचा मेसेज पाठवला आहे" };
    }

    // Hindi Commands
    if (cmd.includes('मौसम') || cmd.includes('बारिश')) {
      navigate('/weather');
      return { matched: true, response: "मौसम का हाल दिखा रहे हैं" };
    }
    if (cmd.includes('मंडी') || cmd.includes('भाव') || cmd.includes('कीमत')) {
      navigate('/market-prices');
      return { matched: true, response: "मंडी भाव खोल रहे हैं" };
    }
    if (cmd.includes('फसल सलाह') || cmd.includes('फसल चुनाव') || cmd.includes('फसल सुझाव')) {
      navigate('/crop-recommendation');
      return { matched: true, response: "फसल चयन सलाहकार शुरू कर रहे हैं" };
    }
    if (cmd.includes('बीमारी पहचान') || cmd.includes('रोग जांच') || cmd.includes('बीमारी जांच')) {
      navigate('/disease-detection');
      return { matched: true, response: "फसल रोग स्कैनर कैमरा खोल रहे हैं" };
    }
    if (cmd.includes('सरकारी योजना') || cmd.includes('योजनाएं') || cmd.includes('सब्सिडी')) {
      navigate('/schemes');
      return { matched: true, response: "सरकारी योजनाएं दिखा रहे हैं" };
    }
    if (cmd.includes('मदद') || cmd.includes('आपातकाल') || cmd.includes('एसओएस')) {
      triggerSOS();
      return { matched: true, response: "आपातकालीन सहायता अलर्ट सक्रिय हो गया है" };
    }

    return { matched: false, response: "" };
  }
}
