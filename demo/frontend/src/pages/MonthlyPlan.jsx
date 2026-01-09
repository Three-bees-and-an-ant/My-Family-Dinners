import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './MonthlyPlan.css';

const MonthlyPlan = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMealPlans();
    fetchMenuItems();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const response = await api.get('/meal-plans');
      const plans = response.data || [];
      setMealPlans(plans);
      if (plans.length > 0) {
        // Fetch full plan details
        const fullPlan = await api.get(`/meal-plans/${plans[0].id}`);
        setSelectedPlan(fullPlan.data);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      // If no plans exist, that's okay
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const createMealPlan = async () => {
    try {
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      
      const response = await api.post('/meal-plans', {
        plan_name: `${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear} Plan`,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_calories_per_day: 2000
      });
      
      const newPlan = response.data;
      setMealPlans([...mealPlans, newPlan]);
      // Fetch full plan with meals
      const fullPlan = await api.get(`/meal-plans/${newPlan.id}`);
      setSelectedPlan(fullPlan.data);
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create meal plan');
    }
  };

  const addMealToPlan = async (menuItemId, date, mealType) => {
    if (!selectedPlan) return;
    
    try {
      await api.post(`/meal-plans/${selectedPlan.id}/meals`, {
        menu_item_id: menuItemId,
        scheduled_date: date,
        meal_type: mealType
      });
      
      fetchMealPlans();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add meal');
    }
  };

  const getDaysInMonth = () => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  };

  const getMealsForDate = (date) => {
    if (!selectedPlan || !selectedPlan.meals) return { breakfast: [], lunch: [], dinner: [], snack: [] };
    
    const dateStr = date.toISOString().split('T')[0];
    return selectedPlan.meals.filter(m => m.scheduled_date === dateStr).reduce((acc, meal) => {
      if (!acc[meal.meal_type]) acc[meal.meal_type] = [];
      acc[meal.meal_type].push(meal);
      return acc;
    }, { breakfast: [], lunch: [], dinner: [], snack: [] });
  };

  const getTotalCaloriesForDate = (date) => {
    const meals = getMealsForDate(date);
    let total = 0;
    Object.values(meals).flat().forEach(meal => {
      const menuItem = menuItems.find(m => m.id === meal.menu_item_id);
      if (menuItem && menuItem.calories) {
        total += menuItem.calories * meal.quantity;
      }
    });
    return total;
  };

  if (loading) {
    return <div className="loading">Loading meal plans...</div>;
  }

  return (
    <div className="page-container">
      <div className="monthly-plan-header">
        <h1 className="page-title">📆 Monthly Meal Planning</h1>
        <p className="plan-subtitle">Plan healthy meals for your family for the entire month</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="plan-controls">
        <div className="month-selector">
          <button onClick={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}>←</button>
          <span className="month-display">
            {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}>→</button>
        </div>

        {mealPlans.length === 0 ? (
          <button onClick={createMealPlan} className="btn btn-primary">
            Create Monthly Plan
          </button>
        ) : (
          <select 
            value={selectedPlan?.id || ''} 
            onChange={async (e) => {
              const planId = parseInt(e.target.value);
              try {
                const response = await api.get(`/meal-plans/${planId}`);
                setSelectedPlan(response.data);
              } catch (error) {
                console.error('Error fetching plan:', error);
              }
            }}
            className="plan-selector"
          >
            {mealPlans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.plan_name}</option>
            ))}
          </select>
        )}
      </div>

      {selectedPlan && (
        <div className="calendar-view">
          {Array.from({ length: getDaysInMonth() }, (_, i) => {
            const date = new Date(selectedYear, selectedMonth, i + 1);
            const meals = getMealsForDate(date);
            const totalCalories = getTotalCaloriesForDate(date);
            const isPast = date < new Date().setHours(0, 0, 0, 0);
            
            return (
              <div key={i + 1} className={`calendar-day ${isPast ? 'past' : ''}`}>
                <div className="day-header">
                  <span className="day-number">{i + 1}</span>
                  <span className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
                <div className="day-meals">
                  {['breakfast', 'lunch', 'dinner'].map(mealType => (
                    <div key={mealType} className={`meal-slot ${mealType}`}>
                      <div className="meal-type-label">{mealType}</div>
                      {meals[mealType].map((meal, idx) => {
                        const menuItem = menuItems.find(m => m.id === meal.menu_item_id);
                        return menuItem ? (
                          <div key={idx} className="meal-item">
                            <span className="meal-name">{menuItem.name}</span>
                            {menuItem.calories && (
                              <span className="meal-calories">{menuItem.calories} cal</span>
                            )}
                          </div>
                        ) : null;
                      })}
                      {meals[mealType].length === 0 && !isPast && (
                        <button 
                          className="add-meal-btn"
                          onClick={() => {
                            const menuItem = menuItems[0];
                            if (menuItem) {
                              addMealToPlan(menuItem.id, date.toISOString().split('T')[0], mealType);
                            }
                          }}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {totalCalories > 0 && (
                  <div className="day-calories">
                    Total: {totalCalories} cal
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!selectedPlan && mealPlans.length === 0 && (
        <div className="no-plan-message">
          <p>Create a monthly meal plan to start organizing your family's healthy meals!</p>
          <button onClick={createMealPlan} className="btn btn-primary">
            Create Your First Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthlyPlan;

