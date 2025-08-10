import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';


const PullToRefresh = ({ onRefresh, children, threshold = 80 }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      // Проверяем, что мы в самом верху страницы
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        currentY.current = startY.current;
      }
    };

    const handleTouchMove = (e) => {
      if (container.scrollTop === 0) {
        currentY.current = e.touches[0].clientY;
        const distance = Math.max(0, currentY.current - startY.current);
        
        if (distance > 0) {
          e.preventDefault();
          setPullDistance(distance);
          setIsPulling(distance > 10);
          
          // Достижение порога для обновления
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling && pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, onRefresh, threshold]);

  const refreshIndicatorStyle = {
    transform: `translateY(${Math.min(pullDistance * 0.5, threshold)}px)`,
    opacity: Math.min(pullDistance / threshold, 1),
  };

  return (
    <div className="pull-to-refresh-container" ref={containerRef}>
      {/* Индикатор обновления */}
      <div 
        className={`refresh-indicator ${isPulling ? 'active' : ''} ${isRefreshing ? 'refreshing' : ''}`}
        style={refreshIndicatorStyle}
      >
        <div className="refresh-icon">
          <RefreshCw size={24} className={isRefreshing ? 'spinning' : ''} />
        </div>
        <div className="refresh-text">
          {isRefreshing ? 'Обновление...' : 'Потяните для обновления'}
        </div>
      </div>

      {/* Основной контент */}
      <div className="pull-to-refresh-content">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
