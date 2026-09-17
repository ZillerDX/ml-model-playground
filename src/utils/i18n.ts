export type Locale = 'en' | 'th';

export interface Translations {
  header: {
    title: string;
    studioBadge: string;
    subtitle: string;
    tabRegression: string;
    tabRegressionDesc: string;
    tabClassification: string;
    tabClassificationDesc: string;
    tabClustering: string;
    tabClusteringDesc: string;
    exportWeights: string;
    themeToggleLight: string;
    themeToggleDark: string;
    langToggle: string;
  };
  common: {
    train: string;
    pause: string;
    step: string;
    stepTooltip: string;
    reset: string;
    resetTooltip: string;
    injectOutliers: string;
    removeOutliers: string;
    removeOutliersBadge: string;
    importCsv: string;
    dropFileOrPaste: string;
    pasteCsvPlaceholder: string;
    autoNormalize: string;
    autoNormalizeHelp: string;
    rowsParsed: string;
    cancel: string;
    importData: string;
    downloadJson: string;
    copyJson: string;
    copied: string;
    close: string;
    warning: string;
    epoch: string;
    loss: string;
    samplesCount: string;
    pointsCount: string;
    residuals: string;
    dragPointHint: string;
    placeSamplesHint: string;
    classA: string;
    classB: string;
    iteration: string;
    chooseCsvFile: string;
    orPasteRawNumbers: string;
    pastePreviewHelp: string;
  };
  regression: {
    title: string;
    datasetLabel: string;
    datasets: {
      linear: string;
      linearDesc: string;
      quadratic: string;
      quadraticDesc: string;
      sine: string;
      sineDesc: string;
      stock: string;
      stockDesc: string;
    };
    optimizerLabel: string;
    degreeLabel: string;
    degreeTooltip: string;
    lrLabel: string;
    lrTooltip: string;
    lrExplosionWarning: string;
    epochsLabel: string;
    epochsTooltip: string;
    regularizationLabel: string;
    regTypes: {
      none: string;
      noneDesc: string;
      l1: string;
      l1Desc: string;
      l2: string;
      l2Desc: string;
    };
    regStrengthLabel: string;
    regStrengthTooltip: string;
    residualsLabel: string;
    lossHistoryTab: string;
    lossContourTab: string;
    contourTitle: string;
    contourDesc: string;
    contourLegendPath: string;
    contourLegendMin: string;
    contourLegendCurr: string;
    divergedAlertTitle: string;
    divergedAlertMsg: string;
    canvasDragHint: string;
    canvasClickHint: string;
    hypothesisTitle: string;
  };
  classification: {
    title: string;
    datasetLabel: string;
    datasets: {
      circles: string;
      circlesDesc: string;
      moons: string;
      moonsDesc: string;
      spiral: string;
      spiralDesc: string;
      blobs: string;
      blobsDesc: string;
    };
    topologyLabel: string;
    activationLabel: string;
    optimizerLabel: string;
    lrLabel: string;
    epochsLabel: string;
    drawClassA: string;
    drawClassB: string;
    clearCustom: string;
    decisionBoundaryTitle: string;
    networkGraphTitle: string;
    lossTitle: string;
    accuracyTitle: string;
    divergedAlertMsg: string;
  };
  clustering: {
    title: string;
    datasetLabel: string;
    datasets: {
      gaussian: string;
      gaussianDesc: string;
      anisotropic: string;
      anisotropicDesc: string;
      varied: string;
      variedDesc: string;
    };
    kLabel: string;
    kTooltip: string;
    initLabel: string;
    initKMeansPlus: string;
    initRandom: string;
    startAuto: string;
    pauseAuto: string;
    nextStep: string;
    resetCentroids: string;
    stepPhase1: string;
    stepPhase2: string;
    inertiaTitle: string;
    inertiaDesc: string;
    clusteringHint: string;
    converged: string;
  };
  notifications: {
    outliersRemoved: string;
    noOutliers: string;
    csvSuccess: string;
    csvError: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    header: {
      title: 'ML Model Playground',
      studioBadge: 'TF.js Studio',
      subtitle: 'Interactive In-Browser Machine Learning Laboratory',
      tabRegression: 'Regression',
      tabRegressionDesc: 'Linear & Polynomial Fitting',
      tabClassification: 'Classification',
      tabClassificationDesc: 'Neural Net & Decision Boundary',
      tabClustering: 'Clustering',
      tabClusteringDesc: 'K-Means Step Centroids',
      exportWeights: 'Export Weights',
      themeToggleLight: 'Switch to Light Mode',
      themeToggleDark: 'Switch to Dark Mode',
      langToggle: 'Switch Language (EN/TH)',
    },
    common: {
      train: 'Start Training',
      pause: 'Pause',
      step: 'Step',
      stepTooltip: 'Step 1 Epoch',
      reset: 'Reset',
      resetTooltip: 'Reset model weights & state',
      injectOutliers: 'Inject Outliers',
      removeOutliers: 'Filter Outliers',
      removeOutliersBadge: 'Outliers',
      importCsv: 'Import Data',
      dropFileOrPaste: 'Upload .csv or paste numeric data (X, Y)',
      pasteCsvPlaceholder: 'e.g.\nx, y\n-2.0, -1.5\n-1.0, -0.7\n0.0, 0.1\n1.0, 0.9\n2.0, 1.8',
      autoNormalize: 'Auto-scale coordinates to fit canvas [-3, 3]',
      autoNormalizeHelp: 'Recommended for real-world units like prices, weights, or temperatures.',
      rowsParsed: 'Valid points parsed',
      cancel: 'Cancel',
      importData: 'Load Dataset',
      downloadJson: 'Download .json',
      copyJson: 'Copy JSON',
      copied: 'Copied!',
      close: 'Close',
      warning: 'Warning',
      epoch: 'Epoch',
      loss: 'Loss',
      samplesCount: 'samples',
      pointsCount: 'points',
      residuals: 'Residuals',
      dragPointHint: 'Click to add data point • Drag to reposition',
      placeSamplesHint: 'Click to place samples:',
      classA: 'Class A (0)',
      classB: 'Class B (1)',
      iteration: 'Iteration',
      chooseCsvFile: 'Choose .csv file',
      orPasteRawNumbers: 'or paste numeric data below',
      pastePreviewHelp: 'Paste X, Y coordinates to preview and load.',
    },
    regression: {
      title: 'Model Configuration',
      datasetLabel: 'Dataset Distribution',
      datasets: {
        linear: 'Linear Trend',
        linearDesc: 'y = wx + b with Gaussian noise',
        quadratic: 'Quadratic Parabola',
        quadraticDesc: 'y = ax² + bx + c curvature',
        sine: 'Sine Wave',
        sineDesc: 'Non-linear cyclic curve',
        stock: 'Stock Volatility',
        stockDesc: 'Financial upward drift with dips',
      },
      optimizerLabel: 'Optimizer',
      degreeLabel: 'Polynomial Degree (Capacity)',
      degreeTooltip: '1 = Linear (y = wx+b), 2 = Quadratic, 3+ = Higher polynomials (prone to overfitting)',
      lrLabel: 'Learning Rate (α)',
      lrTooltip: 'Controls step size along the negative gradient surface.',
      lrExplosionWarning: '⚠️ High learning rate: Gradients may oscillate wildly or diverge to NaN!',
      epochsLabel: 'Target Epochs',
      epochsTooltip: 'Maximum number of complete training passes over the dataset.',
      regularizationLabel: 'Regularization (Penalty)',
      regTypes: {
        none: 'None',
        noneDesc: 'Standard Mean Squared Error',
        l1: 'L1 (Lasso)',
        l1Desc: 'Drives redundant weights to zero (Sparsity)',
        l2: 'L2 (Ridge)',
        l2Desc: 'Smoothly shrinks weights to prevent overfitting',
      },
      regStrengthLabel: 'Penalty Strength (λ)',
      regStrengthTooltip: 'Controls how aggressively weights are penalized. Higher λ forces simpler curves.',
      residualsLabel: 'Residual Vectors',
      lossHistoryTab: 'Loss History (Epochs)',
      lossContourTab: 'Loss Surface (w vs b)',
      contourTitle: '2D Weight Space Loss Contour Map',
      contourDesc: 'Analytical loss bowl L(w,b). Watch gradient descent navigate the quadratic surface!',
      contourLegendPath: 'Optimization Trajectory',
      contourLegendMin: 'Global OLS Minimum',
      contourLegendCurr: 'Current (w, b)',
      divergedAlertTitle: 'Divergence Alert',
      divergedAlertMsg: 'Loss diverged (NaN / Infinity)! Learning rate is too high for this loss surface.',
      canvasDragHint: 'Click & drag points to reposition',
      canvasClickHint: 'Click anywhere to add custom points',
      hypothesisTitle: 'Learned Hypothesis Equation',
    },
    classification: {
      title: 'Network Architecture',
      datasetLabel: 'Dataset Distribution',
      datasets: {
        circles: 'Concentric Circles',
        circlesDesc: 'Non-linear radial separation',
        moons: 'Interlocking Moons',
        moonsDesc: 'Two interleaving half-circles',
        spiral: 'Dual Spirals',
        spiralDesc: 'Challenging high-frequency topology',
        blobs: 'Linearly Separable',
        blobsDesc: 'Gaussian clusters of two classes',
      },
      topologyLabel: 'Hidden Layer Architecture',
      activationLabel: 'Activation Function',
      optimizerLabel: 'Optimizer',
      lrLabel: 'Learning Rate (α)',
      epochsLabel: 'Target Epochs',
      drawClassA: 'Draw Class A (Blue)',
      drawClassB: 'Draw Class B (Orange)',
      clearCustom: 'Clear Custom',
      decisionBoundaryTitle: '2D Decision Boundary Heatmap (P(y=1))',
      networkGraphTitle: 'Network Synapse Topology',
      lossTitle: 'Binary Cross-Entropy Loss',
      accuracyTitle: 'Classification Accuracy',
      divergedAlertMsg: 'Training encountered numerical instability. Reset or reduce learning rate.',
    },
    clustering: {
      title: 'K-Means Configuration',
      datasetLabel: 'Dataset Distribution',
      datasets: {
        gaussian: 'Gaussian Clusters',
        gaussianDesc: 'Isotropic spherical clusters',
        anisotropic: 'Anisotropic Ellipsoids',
        anisotropicDesc: 'Stretched, correlated distributions',
        varied: 'Varied Density',
        variedDesc: 'Clusters with unequal variance',
      },
      kLabel: 'Number of Clusters (K)',
      kTooltip: 'Choose the number of cluster centroids to find.',
      initLabel: 'Centroid Initialization',
      initKMeansPlus: 'K-Means++ (Probabilistic spread)',
      initRandom: 'Random Points',
      startAuto: 'Start Auto Run',
      pauseAuto: 'Pause Run',
      nextStep: 'Next Step (Lloyd’s Cycle)',
      resetCentroids: 'Re-Seed Centroids',
      stepPhase1: 'Phase 1: Voronoi Assignment (Assign points to closest centroid)',
      stepPhase2: 'Phase 2: Mean Update (Shift centroids to arithmetic mean of clusters)',
      inertiaTitle: 'Inertia Curve (WCSS)',
      inertiaDesc: 'Within-Cluster Sum of Squares across Lloyd iterations',
      clusteringHint: 'Click to place data point • Observe centroid vector shifts',
      converged: 'Converged',
    },
    notifications: {
      outliersRemoved: 'Successfully filtered {count} outliers using statistical analysis.',
      noOutliers: 'No outliers detected (all points within statistical thresholds).',
      csvSuccess: 'Successfully loaded {count} points into the dataset.',
      csvError: 'Unable to parse CSV. Please ensure at least 2 numerical columns (x, y).',
    },
  },
  th: {
    header: {
      title: 'ML Model Playground',
      studioBadge: 'TF.js Studio',
      subtitle: 'ห้องทดลอง Machine Learning แบบ Interactive บนเบราว์เซอร์ 100%',
      tabRegression: 'Regression',
      tabRegressionDesc: 'การวิเคราะห์การถดถอยเชิงเส้นและพหุนาม',
      tabClassification: 'Classification',
      tabClassificationDesc: 'โครงข่ายประสาทเทียมและ Decision Boundary',
      tabClustering: 'Clustering',
      tabClusteringDesc: 'การจัดกลุ่ม K-Means แบบทีละสเต็ป',
      exportWeights: 'ส่งออกโมเดล',
      themeToggleLight: 'เปลี่ยนเป็น Light Mode',
      themeToggleDark: 'เปลี่ยนเป็น Dark Mode',
      langToggle: 'สลับภาษา',
    },
    common: {
      train: 'เริ่มการเทรน',
      pause: 'หยุดชั่วคราว',
      step: 'ก้าวทีละก้าว',
      stepTooltip: 'คำนวณการเรียนรู้ 1 Epoch',
      reset: 'รีเซ็ต',
      resetTooltip: 'รีเซ็ตค่าน้ำหนักและสถานะโมเดล',
      injectOutliers: 'จำลองจุดผิดปกติ',
      removeOutliers: 'กรองจุดผิดปกติ',
      removeOutliersBadge: 'จุดผิดปกติ',
      importCsv: 'นำเข้าข้อมูล',
      dropFileOrPaste: 'อัปโหลดไฟล์ .csv หรือวางข้อมูลตัวเลข 2 คอลัมน์ (X, Y)',
      pasteCsvPlaceholder: 'ตัวอย่าง:\nx, y\n-2.0, -1.5\n-1.0, -0.7\n0.0, 0.1\n1.0, 0.9\n2.0, 1.8',
      autoNormalize: 'ปรับสเกลพิกัดอัตโนมัติ [-3, 3]',
      autoNormalizeHelp: 'แนะนำสำหรับข้อมูลหน่วยจริง เช่น ราคาหุ้น น้ำหนัก หรืออุณหภูมิ',
      rowsParsed: 'จำนวนจุดข้อมูล',
      cancel: 'ยกเลิก',
      importData: 'นำเข้าชุดข้อมูล',
      downloadJson: 'ดาวน์โหลด JSON',
      copyJson: 'คัดลอก JSON',
      copied: 'คัดลอกสำเร็จ',
      close: 'ปิด',
      warning: 'คำเตือน',
      epoch: 'Epoch',
      loss: 'Loss',
      samplesCount: 'ตัวอย่าง',
      pointsCount: 'จุด',
      residuals: 'เส้นค่าคลาดเคลื่อน',
      dragPointHint: 'คลิกเพื่อเพิ่มจุด • ลากเพื่อย้ายตำแหน่ง',
      placeSamplesHint: 'คลิกเพื่อวางข้อมูลตัวอย่าง:',
      classA: 'กลุ่ม A (0)',
      classB: 'กลุ่ม B (1)',
      iteration: 'รอบที่',
      chooseCsvFile: 'เลือกไฟล์ .csv',
      orPasteRawNumbers: 'หรือวางตัวเลขพิกัดด้านล่าง',
      pastePreviewHelp: 'วางพิกัด X, Y เพื่อแสดงตัวอย่างและนำเข้าข้อมูล',
    },
    regression: {
      title: 'การตั้งค่าโมเดล',
      datasetLabel: 'ชุดข้อมูลตัวอย่าง',
      datasets: {
        linear: 'แนวโน้มเชิงเส้น',
        linearDesc: 'y = wx + b พร้อมสัญญาณรบกวน Gaussian',
        quadratic: 'เส้นโค้งพาราโบลา',
        quadraticDesc: 'เส้นโค้งกำลังสอง y = ax² + bx + c',
        sine: 'คลื่นไซน์',
        sineDesc: 'เส้นโค้งวัฏจักรแบบไม่เป็นเชิงเส้น',
        stock: 'แนวโน้มราคาหุ้น',
        stockDesc: 'ทิศทางเติบโตพร้อมจุดสวิงขึ้นลง',
      },
      optimizerLabel: 'อัลกอริทึม Optimizer',
      degreeLabel: 'ดีกรีพหุนาม',
      degreeTooltip: '1 = เชิงเส้น (y = wx + b), 2 = กำลังสอง, 3+ = พหุนามขั้นสูง (ระวัง Overfitting)',
      lrLabel: 'อัตราการเรียนรู้ (α)',
      lrTooltip: 'ขนาดก้าวที่โมเดลเคลื่อนที่ตรงข้ามความชัน (Negative Gradient)',
      lrExplosionWarning: '⚠️ อัตราการเรียนรู้สูงเกินไป: ค่าน้ำหนักอาจแกว่งจนระเบิดเป็น NaN',
      epochsLabel: 'จำนวนรอบ (Epochs)',
      epochsTooltip: 'จำนวนรอบการวนเทรนผ่านชุดข้อมูลทั้งหมด',
      regularizationLabel: 'การควบคุมโมเดล (Regularization)',
      regTypes: {
        none: 'ไม่มี',
        noneDesc: 'คำนวณตาม Mean Squared Error ปกติ',
        l1: 'L1 (Lasso)',
        l1Desc: 'บีบค่าน้ำหนักที่ไม่จำเป็นให้กลายเป็น 0 (Sparsity)',
        l2: 'L2 (Ridge)',
        l2Desc: 'ลดขนาดค่าน้ำหนักเพื่อป้องกัน Overfitting',
      },
      regStrengthLabel: 'น้ำหนักบทลงโทษ (λ)',
      regStrengthTooltip: 'ค่ายิ่งสูงโมเดลยิ่งเรียบง่าย ลดการแกว่งตามจุดรบกวน',
      residualsLabel: 'เส้นค่าคลาดเคลื่อน',
      lossHistoryTab: 'กราฟค่า Loss',
      lossContourTab: 'ผิวกระทะ Loss (w vs b)',
      contourTitle: 'ผิวกำลังสอง Loss (Weight Space)',
      contourDesc: 'ผิวกระทะกำลังสอง L(w, b) สังเกตการกลิ้งลงสู่จุดต่ำสุดของ Gradient Descent',
      contourLegendPath: 'เส้นทางการเทรน',
      contourLegendMin: 'จุดต่ำสุด OLS',
      contourLegendCurr: 'พิกัดปัจจุบัน (w, b)',
      divergedAlertTitle: 'โมเดลลู่หลุด (Diverged)',
      divergedAlertMsg: 'ค่า Loss พุ่งเป็น NaN หรือ Infinity! Learning Rate สูงเกินกว่าความชันของพื้นผิว',
      canvasDragHint: 'คลิกแล้วลากเพื่อย้ายจุดข้อมูล',
      canvasClickHint: 'คลิกบนพื้นที่ว่างเพื่อเพิ่มจุดข้อมูล',
      hypothesisTitle: 'สมการโมเดลที่เรียนรู้ได้',
    },
    classification: {
      title: 'โครงสร้างเครือข่าย',
      datasetLabel: 'รูปแบบชุดข้อมูล',
      datasets: {
        circles: 'วงกลมซ้อน',
        circlesDesc: 'การจำแนกแบบรัศมีไม่เป็นเชิงเส้น',
        moons: 'จันทร์เสี้ยวสลับ',
        moonsDesc: 'ส่วนโค้งสองฝั่งสลับไขว้กัน',
        spiral: 'เกลียวคู่',
        spiralDesc: 'รูปแบบความถี่สูงที่ท้าทายโมเดล',
        blobs: 'กลุ่มจุดแยกสองฝั่ง',
        blobsDesc: 'กลุ่มจุดสองฝั่งที่แบ่งได้ด้วยเส้นตรง',
      },
      topologyLabel: 'โครงสร้างชั้นซ่อน (Hidden Layers)',
      activationLabel: 'ฟังก์ชันกระตุ้น (Activation)',
      optimizerLabel: 'อัลกอริทึม Optimizer',
      lrLabel: 'อัตราการเรียนรู้ (α)',
      epochsLabel: 'จำนวนรอบ (Epochs)',
      drawClassA: 'วาด Class A',
      drawClassB: 'วาด Class B',
      clearCustom: 'ล้างจุดวาดเอง',
      decisionBoundaryTitle: 'ขอบเขตการตัดสินใจ (Decision Boundary)',
      networkGraphTitle: 'ผังการเชื่อมต่อไซแนปส์',
      lossTitle: 'Binary Cross-Entropy Loss',
      accuracyTitle: 'ความแม่นยำ (Accuracy)',
      divergedAlertMsg: 'การคำนวณพบปัญหาความไม่เสถียร กรุณารีเซ็ตหรือลดค่า Learning Rate',
    },
    clustering: {
      title: 'การตั้งค่า K-Means',
      datasetLabel: 'รูปแบบการกระจายตัว',
      datasets: {
        gaussian: 'กลุ่มทรงกลม',
        gaussianDesc: 'กลุ่มข้อมูลที่มีการกระจายตัวรอบทิศทางเท่ากัน',
        anisotropic: 'กลุ่มวงรีเฉียง',
        anisotropicDesc: 'กลุ่มข้อมูลที่ยืดออกตามแนวเฉียง',
        varied: 'ความหนาแน่นต่างระดับ',
        variedDesc: 'กลุ่มที่มีขนาดและความหนาแน่นไม่เท่ากัน',
      },
      kLabel: 'จำนวนกลุ่ม (K)',
      kTooltip: 'กำหนดจำนวนจุดศูนย์กลาง (Centroids) ที่ต้องการค้นหา',
      initLabel: 'วิธีกำหนดจุดเริ่มต้น',
      initKMeansPlus: 'K-Means++ (กระจายจุดตามความน่าจะเป็น)',
      initRandom: 'สุ่มตำแหน่งจุด',
      startAuto: 'รันอัตโนมัติ',
      pauseAuto: 'หยุดชั่วคราว',
      nextStep: 'ก้าวถัดไป',
      resetCentroids: 'สุ่มตำแหน่งใหม่',
      stepPhase1: 'เฟส 1: Voronoi Assignment (จัดจุดข้อมูลเข้าหา Centroid ใกล้สุด)',
      stepPhase2: 'เฟส 2: Mean Update (ขยับ Centroid ไปยังค่าเฉลี่ยของกลุ่ม)',
      inertiaTitle: 'กราฟค่าความเฉื่อย Inertia (WCSS)',
      inertiaDesc: 'ผลรวมระยะห่างกำลังสองภายในกลุ่ม (ยิ่งต่ำยิ่งจัดกลุ่มได้กระชับ)',
      clusteringHint: 'คลิกเพื่อวางจุดข้อมูล • สังเกตการขยับของ Centroid',
      converged: 'ลู่เข้าสู่จุดสมดุลแล้ว',
    },
    notifications: {
      outliersRemoved: 'กรองจุดผิดปกติออก {count} จุดเรียบร้อยแล้ว',
      noOutliers: 'ไม่พบจุดผิดปกติ (จุดข้อมูลทั้งหมดอยู่ในเกณฑ์สถิติปกติ)',
      csvSuccess: 'โหลดจุดข้อมูลสำเร็จ {count} จุด',
      csvError: 'ไม่สามารถประมวลผลไฟล์ได้ กรุณาตรวจสอบข้อมูลตัวเลข (X, Y)',
    },
  },
};

export function getTranslation(locale: Locale): Translations {
  return translations[locale] || translations.en;
}
