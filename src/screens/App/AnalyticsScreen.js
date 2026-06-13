import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Svg, { Path, Circle, Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import Card from '../../components/Card';
import { getVitals } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const graphWidth = screenWidth - 72; // Padding margins
const graphHeight = 200;

export default function AnalyticsScreen() {
  const [vitalsList, setVitalsList] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('heartRate'); // 'heartRate' or 'bloodSugar'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const activeUid = await AsyncStorage.getItem('@lifexp_active_user_id');
      if (activeUid) {
        const list = await getVitals(activeUid);
        setVitalsList(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#810b38" />
      </View>
    );
  }

  // Filter and prepare coordinates
  const dataPoints = vitalsList.map(v => ({
    value: v[selectedMetric] || 0,
    label: new Date(v.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }));

  const maxVal = dataPoints.length > 0 ? Math.max(...dataPoints.map(d => d.value)) : 100;
  const minVal = dataPoints.length > 0 ? Math.min(...dataPoints.map(d => d.value)) : 60;
  const range = maxVal - minVal === 0 ? 10 : (maxVal - minVal) * 1.2;
  const offset = minVal - range * 0.1;

  // Generate SVG path points
  const points = dataPoints.map((d, index) => {
    const x = dataPoints.length > 1 ? (index / (dataPoints.length - 1)) * (graphWidth - 40) + 20 : graphWidth / 2;
    // scale y coordinate (inverted since SVG 0,0 is top-left)
    const y = graphHeight - 30 - ((d.value - offset) / range) * (graphHeight - 60);
    return { x, y, value: d.value, label: d.label };
  });

  // Construct SVG Path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  const metricTitle = selectedMetric === 'heartRate' ? 'Heart Rate' : 'Blood Sugar';
  const metricUnit = selectedMetric === 'heartRate' ? 'bpm' : 'mg/dL';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Description */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Unified trends of your logged vitals over time. Tap to switch metrics.</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <Pressable 
            style={[styles.tabBtn, selectedMetric === 'heartRate' && styles.tabBtnActive]}
            onPress={() => setSelectedMetric('heartRate')}
          >
            <Text style={[styles.tabText, selectedMetric === 'heartRate' && styles.tabTextActive]}>Heart Rate</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, selectedMetric === 'bloodSugar' && styles.tabBtnActive]}
            onPress={() => setSelectedMetric('bloodSugar')}
          >
            <Text style={[styles.tabText, selectedMetric === 'bloodSugar' && styles.tabTextActive]}>Blood Sugar</Text>
          </Pressable>
        </View>

        {/* Graph Card */}
        <Card title={`${metricTitle} Trend`}>
          {points.length > 0 ? (
            <View style={styles.graphContainer}>
              <Svg width={graphWidth} height={graphHeight}>
                <Defs>
                  <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#810b38" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="#810b38" stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>

                {/* Y Axis Guide Lines */}
                <Line x1="10" y1={30} x2={graphWidth - 10} y2={30} stroke="rgba(129, 11, 56, 0.05)" strokeWidth={1} />
                <Line x1="10" y1={graphHeight / 2} x2={graphWidth - 10} y2={graphHeight / 2} stroke="rgba(129, 11, 56, 0.05)" strokeWidth={1} />
                <Line x1="10" y1={graphHeight - 30} x2={graphWidth - 10} y2={graphHeight - 30} stroke="rgba(129, 11, 56, 0.08)" strokeWidth={1.5} />

                {/* Plot Path */}
                {pathD ? (
                  <Path
                    d={pathD}
                    fill="none"
                    stroke="#810b38"
                    strokeWidth={3}
                  />
                ) : null}

                {/* Fill Area Gradient (Only if multiple points) */}
                {points.length > 1 && (
                  <Path
                    d={`${pathD} L ${points[points.length - 1].x} ${graphHeight - 30} L ${points[0].x} ${graphHeight - 30} Z`}
                    fill="url(#grad)"
                  />
                )}

                {/* Render Circles & Labels */}
                {points.map((pt, idx) => (
                  <React.Fragment key={idx}>
                    {/* Circle Node */}
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={5}
                      fill="#ffffff"
                      stroke="#810b38"
                      strokeWidth={2}
                    />

                    {/* Value Label Above Circle */}
                    <SvgText
                      x={pt.x}
                      y={pt.y - 12}
                      fontSize="11"
                      fontWeight="bold"
                      fill="#810b38"
                      textAnchor="middle"
                    >
                      {pt.value}
                    </SvgText>

                    {/* Date Label Below X Axis */}
                    <SvgText
                      x={pt.x}
                      y={graphHeight - 12}
                      fontSize="9"
                      fill="#8a7175"
                      textAnchor="middle"
                    >
                      {pt.label}
                    </SvgText>
                  </React.Fragment>
                ))}
              </Svg>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No vital logs available to display trends.</Text>
            </View>
          )}

          <View style={styles.graphFooter}>
            <Text style={styles.footerInfo}>Values are represented in {metricUnit}.</Text>
          </View>
        </Card>

        {/* Vitals Logs Table */}
        <Card title="Recent Logs">
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { flex: 1.5 }]}>Date</Text>
              <Text style={styles.colHeader}>Heart (bpm)</Text>
              <Text style={styles.colHeader}>BP (mmHg)</Text>
              <Text style={styles.colHeader}>Sugar (mg/dL)</Text>
            </View>

            {vitalsList.slice().reverse().map(item => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.colCell, { flex: 1.5, color: '#8a7175' }]}>
                  {new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={[styles.colCell, { fontWeight: '600', color: '#810b38' }]}>{item.heartRate}</Text>
                <Text style={styles.colCell}>{item.bloodPressure}</Text>
                <Text style={[styles.colCell, { fontWeight: '600', color: '#810b38' }]}>{item.bloodSugar}</Text>
              </View>
            ))}

            {vitalsList.length === 0 && (
              <Text style={styles.emptyTableText}>No vitals registered yet.</Text>
            )}
          </View>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f3',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8f3',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#810b38',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#574145',
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff1e3',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(129, 11, 56, 0.08)',
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#810b38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e5b47',
  },
  tabTextActive: {
    color: '#810b38',
  },
  graphContainer: {
    height: graphHeight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  noDataContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#8a7175',
  },
  graphFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  footerInfo: {
    fontSize: 11,
    color: '#8a7175',
    fontStyle: 'italic',
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#810b38',
    paddingBottom: 8,
    marginBottom: 8,
  },
  colHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#810b38',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 11, 56, 0.05)',
    alignItems: 'center',
  },
  colCell: {
    flex: 1,
    fontSize: 12,
    color: '#221a10',
    textAlign: 'center',
  },
  emptyTableText: {
    textAlign: 'center',
    color: '#8a7175',
    marginVertical: 16,
    fontSize: 13,
  },
});
