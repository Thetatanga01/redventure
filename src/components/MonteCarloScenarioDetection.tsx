import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

interface ChartData {
  month: number;
  users: number;
  usersInMillions: number;
  revenue: number;
  revenueInMillions: number;
  min: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  max: number;
  average: number;
}

interface ScenarioSimilarity {
  scenario: string;
  totalSimilarity: number;
  details: {
    initialMAUSimilarity: number;
    growthRateSimilarity: number;
    finalMAUSimilarity: number;
    revenueSimilarity: number;
  };
}

// Tablodaki gelir senaryolarını tanımlıyoruz
const revenueScenarios = [
  { 
    name: "Assertive", 
    mau: 10000000, 
    increaseRatio: 30, 
    additionalUsers: 3000000, 
    revenuePerUser: 5, 
    monthlyRevenue: 15000000, 
    annualRevenue: 180000000, 
    annualRevenueTL: 6811000000 
  },
  { 
    name: "Realistic", 
    mau: 10000000, 
    increaseRatio: 10, 
    additionalUsers: 1000000, 
    revenuePerUser: 5, 
    monthlyRevenue: 5000000, 
    annualRevenue: 60000000, 
    annualRevenueTL: 2270000000 
  },
  { 
    name: "Optional", 
    mau: 5000000, 
    increaseRatio: 3, 
    additionalUsers: 150000, 
    revenuePerUser: 5, 
    monthlyRevenue: 750000, 
    annualRevenue: 9000000, 
    annualRevenueTL: 350000000 
  },
  { 
    name: "Conservative", 
    mau: 5000000, 
    increaseRatio: 1, 
    additionalUsers: 50000, 
    revenuePerUser: 5, 
    monthlyRevenue: 250000, 
    annualRevenue: 3000000, 
    annualRevenueTL: 113000000 
  },
  { 
    name: "Minimum", 
    mau: 1000000, 
    increaseRatio: 1, 
    additionalUsers: 10000, 
    revenuePerUser: 5, 
    monthlyRevenue: 50000, 
    annualRevenue: 600000, 
    annualRevenueTL: 23000000 
  }
];

const App = () => {
  return (
    <div>
      <MonteCarloScenarioDetection />
    </div>
  );
};

const MonteCarloScenarioDetection = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [settings, setSettings] = useState({
    initialUsers: 10000000,  // Başlangıç MAU değeri
    growthRate: 10,          // Büyüme oranı
    stdDev: 3,               // Standart sapma
    months: 12,              // Simülasyon süresi
    simulations: 100,        // Simülasyon sayısı
    revenuePerUser: 5,       // Kullanıcı başına gelir
    additionalUsers: 10000   // Ek kullanıcılar
  });
  const [matchedScenario, setMatchedScenario] = useState<ScenarioSimilarity | null>(null);
  const [scenarioSimilarities, setScenarioSimilarities] = useState<ScenarioSimilarity[]>([]);
  
  // Monte Carlo simülasyonu
  const runSimulation = () => {
    const { initialUsers, growthRate, stdDev, months, simulations, revenuePerUser } = settings;
    const growthRateDecimal = growthRate / 100;
    const stdDevDecimal = stdDev / 100;
    
    // Tüm simülasyonları saklamak için array
    const allSimulations = [];
    
    // Her bir simülasyon için
    for (let sim = 0; sim < simulations; sim++) {
      let currentUsers = initialUsers;
      const simulationData = [currentUsers];
      
      // Her ay için rassal büyüme oranı uygula
      for (let month = 0; month < months; month++) {
        // Normal dağılımdan rassal büyüme oranı oluştur
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        let randomGrowthRate = growthRateDecimal + stdDevDecimal * z0;
        
        currentUsers = currentUsers * (1 + randomGrowthRate);
        simulationData.push(currentUsers);
      }
      
      allSimulations.push(simulationData);
    }
    
    // İstatistikleri hesapla
    const chartData: ChartData[] = [];
    
    for (let month = 0; month <= months; month++) {
      const monthValues = allSimulations.map(sim => sim[month]);
      monthValues.sort((a, b) => a - b);
      
      const min = monthValues[0];
      const max = monthValues[monthValues.length - 1];
      const p25 = monthValues[Math.floor(monthValues.length * 0.25)];
      const p50 = monthValues[Math.floor(monthValues.length * 0.5)];
      const p75 = monthValues[Math.floor(monthValues.length * 0.75)];
      const p95 = monthValues[Math.floor(monthValues.length * 0.95)];
      const average = monthValues.reduce((a, b) => a + b, 0) / monthValues.length;
      
      // additionalUsers hesapla
      const additionalUsers = average * growthRateDecimal;
      
      // Gelir hesaplamaları
      const averageRevenue = (additionalUsers * revenuePerUser);
      
      chartData.push({
        month,
        users: average,
        usersInMillions: average / 1000000,
        revenue: averageRevenue,
        revenueInMillions: averageRevenue / 1000000,
        min: min / 1000000,
        p25: p25 / 1000000,
        p50: p50 / 1000000,
        p75: p75 / 1000000,
        p95: p95 / 1000000,
        max: max / 1000000,
        average: average / 1000000
      });
    }
    
    setData(chartData);
    
    // Simülasyon sonuçlarını senaryolarla karşılaştır
    if (chartData.length > 0) {
      detectMatchingScenario(chartData);
    }
  };

  // Simülasyon sonuçlarını senaryolarla karşılaştırma
  const detectMatchingScenario = (chartData: ChartData[]) => {
    // Son ay verileri
    const finalMonth = chartData[chartData.length - 1];
    
    // Her senaryo için benzerlik puanı hesaplama
    const similarities: ScenarioSimilarity[] = revenueScenarios.map(scenario => {
      // Başlangıç MAU benzerliği (0-10 puan)
      const mauSimilarityWeight = 10;
      const initialMAUSimilarity = 10 - Math.min(10, Math.abs(settings.initialUsers - scenario.mau) / 1000000);
      
      // Büyüme oranı benzerliği (0-30 puan)
      const growthRateSimilarityWeight = 30;
      const growthRateSimilarity = 30 - Math.min(30, Math.abs(settings.growthRate - scenario.increaseRatio) * 2);
      
      // 12 ay sonunda ulaşılan MAU benzerliği (0-30 puan)
      const finalMAUSimilarityWeight = 30;
      // Senaryo büyüme oranıyla hesaplanan 12 ay sonundaki MAU
      const scenarioFinalMAU = scenario.mau * Math.pow(1 + scenario.increaseRatio / 100, 12);
      const simFinalMAU = finalMonth.users;
      const finalMAUSimilarity = 30 - Math.min(30, Math.abs(simFinalMAU - scenarioFinalMAU) / 1000000);
      
      // Aylık gelir benzerliği (0-30 puan)
      const revenueSimilarityWeight = 30;
      const scenarioMonthlyRevenue = scenario.monthlyRevenue;
      const simMonthlyRevenue = finalMonth.revenue;
      const revenueSimilarity = 30 - Math.min(30, Math.abs(simMonthlyRevenue - scenarioMonthlyRevenue) / 1000000);
      
      // Toplam benzerlik puanı (0-100)
      const totalSimilarity = 
        (initialMAUSimilarity * mauSimilarityWeight / 10) + 
        (growthRateSimilarity * growthRateSimilarityWeight / 30) + 
        (finalMAUSimilarity * finalMAUSimilarityWeight / 30) + 
        (revenueSimilarity * revenueSimilarityWeight / 30);
      
      // Her kriter için detayları da döndürelim
      return {
        scenario: scenario.name,
        totalSimilarity,
        details: {
          initialMAUSimilarity: initialMAUSimilarity * mauSimilarityWeight / 10,
          growthRateSimilarity: growthRateSimilarity * growthRateSimilarityWeight / 30,
          finalMAUSimilarity: finalMAUSimilarity * finalMAUSimilarityWeight / 30,
          revenueSimilarity: revenueSimilarity * revenueSimilarityWeight / 30
        }
      };
    });
    
    // Benzerlik puanlarına göre sıralama
    const sortedSimilarities = [...similarities].sort((a, b) => b.totalSimilarity - a.totalSimilarity);
    setScenarioSimilarities(sortedSimilarities);
    
    // En yüksek benzerlik puanına sahip senaryoyu bul
    const bestMatch = sortedSimilarities[0];
    setMatchedScenario(bestMatch);
  };

  // Ayarlar değiştiğinde simülasyonu yeniden çalıştır
  useEffect(() => {
    runSimulation();
  }, [settings]);

  // Form handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "initialUsers") {
      setSettings(prev => ({ ...prev, initialUsers: parseFloat(value) * 1000000 }));
    } else {
      setSettings(prev => ({ ...prev, [name]: parseFloat(value) }));
    }
  };
  
  // Benzerlik yüzdesini hesapla (0-100 arası)
  const getSimilarityPercentage = (similarity: number) => {
    return Math.round(similarity);
  };
  
  // Formatlanmış para değeri
  const formatCurrency = (value: number, currency = '€') => {
    return `${currency}${(value / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="simulation-container">
      <h2 className="title">RedVenture Senaryo Belirleme Aracı</h2>
      
      <div className="controls" style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px' }}>
        <div className="control-item">
          <label>Başlangıç MAU (Milyon)</label>
          <input
            type="number"
            name="initialUsers"
            value={settings.initialUsers / 1000000}
            onChange={handleChange}
          />
        </div>
        <div className="control-item">
          <label>Büyüme Oranı (%)</label>
          <input
            type="number"
            name="growthRate"
            value={settings.growthRate}
            onChange={handleChange}
          />
        </div>
        <div className="control-item">
          <label>Std. Sapma (%)</label>
          <input
            type="number"
            name="stdDev"
            value={settings.stdDev}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="controls" style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px' }}>
        <div className="control-item">
          <label>Kullanıcı Başına Gelir (€)</label>
          <input
            type="number"
            name="revenuePerUser"
            value={settings.revenuePerUser}
            onChange={handleChange}
            step="0.1"
          />
        </div>
        <div className="control-item">
          <label>Simülasyon Sayısı</label>
          <input
            type="number"
            name="simulations"
            value={settings.simulations}
            onChange={handleChange}
          />
        </div>
        <div className="control-item">
          <label>Ek Kullanıcılar</label>
          <input
            type="number"
            name="additionalUsers"
            value={(settings.initialUsers * settings.growthRate / 100).toFixed(0)}
            readOnly
          />
        </div>
      </div>
      
      {/* MAU Projeksiyonu Grafiği */}
      <div className="chart-container">
        <h3>Monthly Active Users Monte Carlo Simulasyonu</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: 'Ay', position: 'insideBottomRight', offset: -5 }} />
            <YAxis label={{ value: 'MAU (Milyon)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => [`${value.toFixed(2)}M`, 'MAU']} />
            <Legend />
            
            <Area type="monotone" dataKey="min" stackId="1" fill="#f5f5f5" stroke="none" name="Min-Max Aralığı" />
            <Area type="monotone" dataKey="max" stackId="1" fill="#f5f5f5" stroke="none" name=" " />
            
            <Line type="monotone" dataKey="average" stroke="#0066cc" strokeWidth={2} name="Ortalama MAU" />
            <Line type="monotone" dataKey="p95" stroke="#ff9900" strokeWidth={1} name="95. Yüzdelik" />
            <Line type="monotone" dataKey="simulations" stroke="#00cc66" strokeWidth={1} name="Simülasyon Sayısı" />
            <Line type="monotone" dataKey="min" stroke="#ff0000" strokeWidth={1} name="Minimum Simülasyon" />
            <Line type="monotone" dataKey="max" stroke="#00ff00" strokeWidth={1} name="Maksimum Simülasyon" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Senaryo Eşleştirme Sonucu */}
      {matchedScenario && (
        <div className="analysis-container">
          <h3>Senaryo Analizi</h3>
          
          <div className="analysis-section">
            <h4>En Yakın Senaryo Eşleşmesi</h4>
            <div className="scenario-match">
              <div className="match-header">
                <h5 className="match-title">
                  {matchedScenario.scenario} Senaryosu
                </h5>
                <span className="match-score">
                  Benzerlik: %{getSimilarityPercentage(matchedScenario.totalSimilarity)}
                </span>
              </div>
              
              <div className="match-details">
                <p>Girilen parametreleriniz <strong>{matchedScenario.scenario}</strong> senaryosuna 
                  <strong> %{getSimilarityPercentage(matchedScenario.totalSimilarity)}</strong> oranında benzemektedir.
                </p>
                
                <div className="match-criteria">
                  <h6>Eşleşme Kriterleri:</h6>
                  <div className="criteria-progress">
                    <div className="criterion">
                      <span>Başlangıç MAU Benzerliği:</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-value" 
                          style={{width: `${matchedScenario.details.initialMAUSimilarity}%`}}
                        ></div>
                      </div>
                      <span>{Math.round(matchedScenario.details.initialMAUSimilarity)}%</span>
                    </div>
                    <div className="criterion">
                      <span>Büyüme Oranı Benzerliği:</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-value" 
                          style={{width: `${matchedScenario.details.growthRateSimilarity}%`}}
                        ></div>
                      </div>
                      <span>{Math.round(matchedScenario.details.growthRateSimilarity)}%</span>
                    </div>
                    <div className="criterion">
                      <span>Final MAU Benzerliği:</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-value" 
                          style={{width: `${matchedScenario.details.finalMAUSimilarity}%`}}
                        ></div>
                      </div>
                      <span>{Math.round(matchedScenario.details.finalMAUSimilarity)}%</span>
                    </div>
                    <div className="criterion">
                      <span>Gelir Benzerliği:</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-value" 
                          style={{width: `${matchedScenario.details.revenueSimilarity}%`}}
                        ></div>
                      </div>
                      <span>{Math.round(matchedScenario.details.revenueSimilarity)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tüm Senaryolar Karşılaştırması */}
          <div className="analysis-section">
            <h4>Tüm Senaryolarla Karşılaştırma</h4>
            <div className="scenarios-comparison">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Senaryo</th>
                    <th>Benzerlik</th>
                    <th>Başlangıç MAU</th>
                    <th>Büyüme (%)</th>
                    <th>12. Ay MAU</th>
                    <th>Aylık Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioSimilarities.map((item, index) => {
                    const scenario = revenueScenarios.find(s => s.name === item.scenario);
                    return (
                      <tr key={index} className={index === 0 ? "best-match" : ""}>
                        {scenario && (
                          <>
                            <td>{scenario.name}</td>
                            <td>%{getSimilarityPercentage(item.totalSimilarity)}</td>
                            <td>{(scenario.mau / 1000000).toFixed(1)}M</td>
                            <td>%{scenario.increaseRatio}</td>
                            <td>{(scenario.mau * Math.pow(1 + scenario.increaseRatio / 100, 12) / 1000000).toFixed(1)}M</td>
                            <td>{formatCurrency(scenario.monthlyRevenue)}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  <tr className="simulation-results">
                    <td><strong>Simülasyon</strong></td>
                    <td>-</td>
                    <td>{(settings.initialUsers / 1000000).toFixed(1)}M</td>
                    <td>%{settings.growthRate}</td>
                    <td>{data.length > 0 ? data[data.length - 1].average.toFixed(1) + "M" : "-"}</td>
                    <td>{data.length > 0 ? formatCurrency(data[data.length - 1].revenue) : "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 12 Ay Sonundaki Tahmini Finansal Sonuçlar */}
          <div className="analysis-section">
            <h4>12 Ay Sonundaki Tahmini Finansal Sonuçlar</h4>
            {data.length > 0 && (
              <div className="financial-projection">
                <div className="projection-row">
                  <div className="projection-item">
                    <h6>MAU Sonuç</h6>
                    <p className="projection-value">{data[data.length - 1].average.toFixed(2)}M</p>
                  </div>
                  <div className="projection-item">
                    <h6>Aylık Gelir</h6>
                    <p className="projection-value">{formatCurrency(data[data.length - 1].revenue)}</p>
                  </div>
                  <div className="projection-item">
                    <h6>Yıllık Gelir Tahmini</h6>
                    <p className="projection-value">{formatCurrency(data[data.length - 1].revenue * 12)}</p>
                  </div>
                </div>
                
                <div className="scenario-comparison">
                  <p>
                    <strong>{matchedScenario.scenario}:</strong>  
                    &nbsp;{data[data.length - 1].average.toFixed(2)}M MAU ve {formatCurrency(data[data.length - 1].revenue)} aylık gelir ile, en olası senaryo {matchedScenario.scenario} olarak görülmektedir.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Senaryo Açıklamaları */}
      <div className="info-container">
        <h3>Senaryo Açıklamaları</h3>
        <div className="scenario-descriptions">
          <div className="scenario-card assertive">
            <h4>Assertive (İddialı)</h4>
            <p>10M başlangıç MAU, %30 artış oranı, kullanıcı başına 5€ gelir</p>
            <p>Yıllık gelir: 180M €</p>
          </div>
          <div className="scenario-card realistic">
            <h4>Realistic (Gerçekçi)</h4>
            <p>10M başlangıç MAU, %10 artış oranı, kullanıcı başına 5€ gelir</p>
            <p>Yıllık gelir: 60M €</p>
          </div>
          <div className="scenario-card optional">
            <h4>Optional (Opsiyonel)</h4>
            <p>5M başlangıç MAU, %3 artış oranı, kullanıcı başına 5€ gelir</p>
            <p>Yıllık gelir: 9M €</p>
          </div>
          <div className="scenario-card conservative">
            <h4>Conservative (Muhafazakar)</h4>
            <p>5M başlangıç MAU, %1 artış oranı, kullanıcı başına 5€ gelir</p>
            <p>Yıllık gelir: 3M €</p>
          </div>
          <div className="scenario-card minimum">
            <h4>Minimum</h4>
            <p>1M başlangıç MAU, %1 artış oranı, kullanıcı başına 5€ gelir</p>
            <p>Yıllık gelir: 0.6M €</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 